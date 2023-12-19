import { json, type MetaFunction } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useRevalidator } from "@remix-run/react";
import Shell from "~/components/Shell";
import { authenticator } from "~/lib/auth.server";
import { formatName } from "~/lib/issues";
import prisma from "~/lib/prisma";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkGithub from "remark-github";
import removeComments from "remark-remove-comments";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export const meta: MetaFunction = () => {
  return [
    { title: "Muddle" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function action({ request }) {
  const form = await request.formData();

  const bounty = form.get("bounty");

  if (request.method === "PATCH") {
    const authenticatedUser = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });

    const user = await prisma.user.findUnique({
      where: {
        id: authenticatedUser.id,
      },
      include: {
        assigned: true,
      },
    });

    if (
      user?.assigned &&
      user.assigned.some((assignedBounty) => assignedBounty.id === bounty)
    ) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          assigned: {
            disconnect: {
              id: bounty,
            },
          },
        },
      });

      return json({ message: "disconnected" });
    } else {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          assigned: {
            connect: {
              id: bounty,
            },
          },
        },
      });

      return json({ message: "connected" });
    }
  }
}

export default function Bounty() {
  const data = useLoaderData<typeof loader>();
  const action = useActionData<typeof action>();
  const revalidator = useRevalidator();

  useEffect(() => {
    if (action?.message === "connected") {
      toast.success("Bounty marked as in progress");
      revalidator.revalidate();
    } else if (action?.message === "disconnected") {
      toast.success("Bounty successfully unassigned");
      revalidator.revalidate();
    }
  }, [action]);

  return (
    <Shell
      heading={formatName(data.bounty?.name || "Unknown")}
      user={data.user}
    >
      <div className="grid grid-cols-3 gap-x-4">
        <div className="col-span-2 border border-gray-100 rounded-lg px-7 py-4 text-sm">
          {data?.bounty?.submissions &&
            data?.bounty?.submissions?.length > 0 && (
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h2 className="font-heading text-xl mb-4 text-orange-500">
                  Pending review
                </h2>
                <p className="text-gray-500 mb-4">
                  Someone has already made a submission for this bounty and
                  it&apos;s currently pending review. You can check out their PR
                  below, and decide if you want to submit your own solution.
                </p>
                <ul className="space-y-4">
                  {data.bounty?.submissions.map((submission) => (
                    <li key={submission.id}>
                      <a
                        href={submission.url}
                        className="font-medium text-gray-900 hover:text-gray-700"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {submission.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          <h2 className="font-heading text-xl mb-4">Description</h2>
          <div className="prose text-gray-500 prose-headings:font-heading prose-headings:text-gray-900 prose-headings:mb-2">
            <Markdown
              remarkPlugins={[
                remarkGfm,
                removeComments,
                [
                  remarkGithub,
                  {
                    repository:
                      data.bounty?.project?.company?.github +
                      "/" +
                      data.bounty?.project?.repo,
                  },
                ],
              ]}
            >
              {data.bounty?.description}
            </Markdown>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-7 py-4 text-sm">
            <h2 className="font-heading text-xl mb-2">Reward</h2>
            <p className="text-gray-500 mb-4">
              An approved submission for this bounty will immediately receive{" "}
              <span className="text-gray-900 font-medium">
                ${data.bounty?.value}
              </span>
              .
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-7 py-4 text-sm">
            <h2 className="font-heading text-xl mb-2">GitHub</h2>
            <p className="text-gray-500 mb-8">
              This bounty is imported from the{" "}
              <span className="text-gray-900 font-medium">
                {data.bounty?.project?.company?.github +
                  "/" +
                  data.bounty?.project?.repo}
              </span>{" "}
              repository.
            </p>
            <div className="flex">
              <a
                href={data.bounty?.issue || ""}
                className="w-full text-center bg-white hover:bg-gray-50 text-gray-900 border border-gray-100 font-medium rounded-lg px-4 py-2 text-xs"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-7 py-4 text-sm">
            {!data.bounty?.assignees.some(
              (user) => user.id === data.user?.id
            ) ? (
              <>
                <h2 className="font-heading text-xl mb-2">
                  Interested in working on this?
                </h2>
                <p className="text-gray-500 mb-8">
                  Mark it as in progress and it will show up on the{" "}
                  <span className="text-gray-900 font-medium">My Tasks</span>{" "}
                  page.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-heading text-xl mb-2">
                  You&apos;re working on this bounty
                </h2>
                <p className="text-gray-500 mb-8">
                  You can see this bounty on the{" "}
                  <span className="text-gray-900 font-medium">My Tasks</span>{" "}
                  page. You can unassign yourself if you want to stop working on
                  this.
                </p>
              </>
            )}
            <div className="flex">
              <Form method="patch" className="w-full">
                <input type="hidden" name="bounty" value={data.bounty?.id} />
                {!data.bounty?.assignees.some(
                  (user) => user.id === data.user?.id
                ) ? (
                  <button
                    className="w-full text-center bg-white hover:bg-gray-50 text-gray-900 border border-gray-100 font-medium rounded-lg px-4 py-2 text-xs"
                    type="submit"
                  >
                    Mark as in progress
                  </button>
                ) : (
                  <button
                    className="w-full text-center bg-white hover:bg-gray-50 text-gray-900 border border-gray-100 font-medium rounded-lg px-4 py-2 text-xs"
                    type="submit"
                  >
                    Stop working on this bounty
                  </button>
                )}
              </Form>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-7 py-4 text-sm">
            <h2 className="font-heading text-xl mb-2">Ready to submit?</h2>
            <p className="font-medium text-gray-700 mb-4">
              If you&apos;re ready to submit your attempt at this bounty, please
              make sure the following is completed:
            </p>
            <ul className="text-gray-400 list-disc ml-4 text-xs space-y-4">
              <li>
                You have your GitHub username set correctly in your profile
              </li>
              <li>
                You have submitted an open pull request against the repository
              </li>
            </ul>
            <div className="mt-8 flex">
              <Link
                to={"/submit/" + data.bounty?.id}
                className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2 text-xs"
              >
                Submit a solution
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </Shell>
  );
}

export async function loader({ params, request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const bounty = await prisma.bounty.findUnique({
    where: {
      id: params.bounty,
    },
    include: {
      assignees: true,
      submissions: true,
      project: {
        include: {
          company: true,
        },
      },
    },
  });

  return json({ bounty, user });
}
