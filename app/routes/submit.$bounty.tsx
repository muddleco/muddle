import { redirect } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import Shell from "~/components/Shell";
import prisma from "~/lib/prisma";
import { Octokit } from "octokit";
import { authenticator } from "~/lib/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Muddle" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const action = async (args) => {
  const user = await authenticator.isAuthenticated(args.request, {
    failureRedirect: "/login",
  });

  const formData = await args.request.formData();

  const url = formData.get("url");

  await prisma.submission.create({
    data: {
      url: url as string,
      bounty: {
        connect: {
          id: args.params.bounty,
        },
      },
      user: {
        connect: {
          id: user?.id,
        },
      },
    },
  });

  return redirect("/dashboard");
};

export default function Bounty() {
  const actionData = useActionData();
  const data = useLoaderData<typeof loader>();

  return (
    <Shell heading={"Submit a solution: " + data.bounty?.name} user={data.user}>
      <div className="border border-gray-100 rounded-lg px-7 py-4 text-sm mb-4">
        <h2 className="font-heading text-xl mb-4">
          Automatically link from GitHub
        </h2>
        <div className="rounded-lg border border-gray-100 text-gray-900 text-sm shadow-sm">
          {data.pulls?.length === 0 && (
            <div className="px-4 p-3 border-b text-gray-500">
              <span className="font-medium text-gray-950">
                We couldn&apos;t find any PRs made by you.
              </span>{" "}
              Make sure your GitHub username is set in your profile.
            </div>
          )}
          {data.pulls?.map((pull) => (
            <div key={pull.id} className="px-4 pt-2 pb-3 border-b border-gray-100 flex">
              <div className="font-medium pt-1.5">{pull.title}</div>
              <div className="ml-auto">
                <Form method="post">
                  <input type="hidden" name="url" value={pull.html_url} />
                  <button className="mt-0.5 rounded-md bg-orange-500 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-orange-500 focus-visible:outline">
                    Submit this PR
                  </button>
                </Form>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-gray-100 rounded-lg px-7 py-4 text-sm">
        <h2 className="font-heading text-xl mb-4">Manually submit</h2>
        <Form method="post" className="space-y-4">
          <div className="flex flex-col">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              URL
            </label>
            <input
              type="text"
              name="url"
              placeholder="https://github.com/calcom/cal.com/pulls/1"
              className="block w-full rounded-md border border-gray-100 px-4 py-1.5 outline-none text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6"
            />
          </div>
          <div>
            <button
              type="submit"
              className="text-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2 text-xs"
            >
              Submit solution
            </button>
          </div>

          {actionData?.error ? (
            <p className="text-red-500">{actionData.error}</p>
          ) : null}
        </Form>
      </div>
    </Shell>
  );
}

export const loader = async (args) => {
  const user = await authenticator.isAuthenticated(args.request, {
    failureRedirect: "/login",
  });

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const bounty = await prisma.bounty.findUnique({
    where: { id: args.params.bounty },
    include: {
      project: {
        include: {
          company: true,
        },
      },
    },
  });

  const pulls = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
    owner: bounty?.project?.company?.github || "calcom",
    repo: bounty?.project?.repo || "cal.com",
  });

  const filteredPulls = pulls.data.filter(
    (pull) => pull.user?.login === user?.github
  );

  return { bounty, pulls: filteredPulls, user };
};
