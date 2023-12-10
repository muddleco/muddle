import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import Shell from "~/components/Shell";
import prisma from "~/lib/prisma";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { Octokit } from "octokit";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

export const meta: MetaFunction = () => {
  return [
    { title: "Muddle" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const action = async (args) => {
  const formData = await args.request.formData();

  const title = formData.get("title");
  const description = formData.get("description");
  const value = formData.get("reward");
  const github = formData.get("github");
  const type = formData.get("type");

  // Create the bounty
  const bounty = await prisma.bounty.create({
    data: {
      title,
      description,
      github,
      type,
      value: parseInt(value as string),
      project: { connect: { id: args.params.project || 1 } },
    },
  });

  return bounty;
};

export default function New() {
  const actionData = useActionData();
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, isLoading] = useState(false);
  const [toasted, setToasted] = useState(false);

  useEffect(() => {
    if (data.issues) {
      isLoading(false);
    }

    if (actionData && !toasted) {
      toast.success("Bounty created successfully!");
      setToasted(true);
    }
  }, [data.issues, actionData]);

  if (data.user?.projectId === null) {
    return <div>Not allowed</div>;
  }

  return (
    <Shell heading="Create a new bounty">
      <div className="px-7 py-5 rounded-lg border border-gray-100">
        <h1 className="font-heading text-xl mb-6">
          Automatically create from GitHub
        </h1>
        <div className="bg-gray-50 rounded-t-lg border-t border-l border-r text-gray-900 text-sm shadow-sm px-4 py-3 flex items-center">
          <div className="border-r pr-2 text-gray-500">
            {data.issues[0] && (
              <span className="font-medium text-gray-900">
                {data.issues[0].url.split("/")[4]}/
                {data.issues[0].url.split("/")[5]}
              </span>
            )}
          </div>
          <div>
            <p className="text-gray-500 pl-2">
              {searchParams.get("label") ? (
                <>
                  {"Filtering by label " + searchParams.get("label")}
                  <Link to="?label=" className="block text-xs font-medium">
                    Clear filters
                  </Link>
                </>
              ) : (
                "Click a label to filter issues"
              )}
            </p>
          </div>
          <div className="ml-auto text-gray-500">
            Page{" "}
            <span className="font-medium text-gray-900">
              {searchParams.get("page") || "1"}
            </span>
          </div>
          <div className="ml-4 text-gray-900 font-medium mr-2">
            <button
              onClick={() => {
                isLoading(true);
                setSearchParams((prev) => {
                  // Get the current page number, or default to 1 if it's not set
                  const currentPage = parseInt(prev.get("page") || "1");
                  // Set the page parameter to the current page number plus one
                  prev.set("page", (currentPage - 1).toString());
                  return prev;
                });
              }}
              className="bg-white rounded-lg px-2 py-1 border border-gray-100"
            >
              Prev
            </button>
          </div>
          <div className="text-gray-900 font-medium">
            <button
              onClick={() => {
                isLoading(true);
                setSearchParams((prev) => {
                  // Get the current page number, or default to 1 if it's not set
                  const currentPage = parseInt(prev.get("page") || "1");
                  // Set the page parameter to the current page number plus one
                  prev.set("page", (currentPage + 1).toString());
                  return prev;
                });
              }}
              className="bg-white rounded-lg px-2 py-1 border border-gray-100"
            >
              Next
            </button>
          </div>
        </div>
        <div className="rounded-b-lg border text-gray-900 text-sm shadow-sm py-1">
          {loading && (
            <div className="w-full h-screen bg-white z-50 text-center pt-24">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="inline w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-orange-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="block mt-4 font-cal text-gray-900 text-2xl">
                  Fetching issues
                </span>
              </div>
            </div>
          )}
          {data.issues.length > 0 ? (
            data.issues?.map((issue) => (
              <div
                key={issue.id}
                className="px-4 py-2 border-b flex items-center"
              >
                <div className="w-2/3">
                  <a
                    className="font-medium hover:text-orange-700 pt-1.5"
                    href={issue.html_url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {issue.title}
                  </a>
                  <div className="flex flex-wrap mt-1">
                    {issue.labels.map((label) => (
                      <Link
                        to={`?label=${label.name}`}
                        key={label.id}
                        style={{
                          backgroundColor:
                            "color-mix(in srgb, #" +
                            label.color +
                            ", transparent 50%)",
                          color:
                            "color-mix(in srgb, #" + label.color + ", #000)",
                          border: "1px solid" + label.color,
                        }}
                        className="mr-2 mb-2 text-xs font-semibold px-2.5 py-0.5 rounded"
                      >
                        {label.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="ml-auto">
                  <Form method="post">
                    <input type="hidden" name="title" value={issue.title} />
                    <input
                      type="hidden"
                      name="description"
                      value={issue.body || "Unknown"}
                    />
                    <input type="hidden" name="github" value={issue.html_url} />
                    <input type="hidden" name="type" value="BOUNTY" />
                    <input
                      type="number"
                      name="reward"
                      placeholder="$20"
                      className="border border-gray-100 rounded-lg w-16 px-2 py-1 outline-none text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 mr-2"
                    />
                    <button
                      onClick={() => setToasted(false)}
                      className="rounded-md bg-orange-600 px-2 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline"
                    >
                      Create bounty
                    </button>
                  </Form>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 border-b text-gray-500">
              <span className="text-orange-700 font-medium text-lg mb-2">
                No issues found.
              </span>
              <br />
              You&apos;ve probably added all of the issues from this page as
              bounties. If so, go to the next page.
            </div>
          )}
          <div className="px-4 pt-4 pb-3 flex text-gray-400">
            <span className="font-medium text-gray-500">
              Can&apos;t find what you&apos;re looking for?
            </span>
            &nbsp;Reach out to support, or create the issue manually.
          </div>
        </div>
      </div>
      <div className="px-7 py-5 rounded-lg border border-gray-100 mt-8">
        <h1 className="font-heading text-xl mb-6">
          Manually create a bounty or challenge
        </h1>
        <Form method="post" className="space-y-4">
          <div className="flex flex-col">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Add a short, concise title"
              className="block w-full rounded-md border px-4 py-1.5 outline-none text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Add a detailed description"
              className="block w-full rounded-md border px-4 py-1.5 outline-none text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              GitHub Link
            </label>
            <input
              type="text"
              name="github"
              placeholder="https://github.com/calcom/cal.com/issues/12374"
              className="block w-full rounded-md border px-4 py-1.5 outline-none text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Type
            </label>
            <select
              name="type"
              className="block w-full rounded-md border py-1.5 text-gray-900 shadow-sm outline-none sm:max-w-xs sm:text-sm sm:leading-6"
            >
              <option value="BOUNTY">
                Bounty (one person works on one task)
              </option>
              <option value="CHALLENGE">
                Challenge (multiple people submit different attempts to one
                task)
              </option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Reward
            </label>
            <input
              type="number"
              name="reward"
              placeholder="$20"
              className="block w-full rounded-md border px-4 py-1.5 outline-none text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6"
            />
          </div>
          <div>
            <button
              type="submit"
              className="rounded-md bg-orange-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              Create and publish
            </button>
          </div>

          {actionData?.error ? (
            <p className="text-red-500">{actionData.error}</p>
          ) : null}
        </Form>
      </div>
      <Toaster />
    </Shell>
  );
}

export const loader = async (args) => {
  // Add authentication user lookup here
  const user = await prisma.user.findUnique({
    where: { email: "bailey@cal.com" },
  });

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const project = await prisma.project.findUnique({
    where: { id: args.params.project || 0 },
    include: { company: true },
  });

  const bounties = await prisma.bounty.findMany({
    where: { projectId: args.params.project || 0 },
    select: { issue: true },
  });

  // Extract GitHub issue URLs from bounties
  const bountyIssueUrls = bounties
    .map((bounty) => bounty.issue)
    .filter((url) => url);

  const url = new URL(args.request.url);
  const page = url.searchParams.get("page");
  const label = url.searchParams.get("label");

  const unfilteredIssues = await octokit.request(
    "GET /repos/{owner}/{repo}/issues",
    {
      owner: project?.company?.github || "calcom",
      repo: project?.repo || "cal.com",
      page: parseInt(page || "1"),
      labels: label || "",
    }
  );

  // Filter out issues that are already listed in bounties
  const issues = unfilteredIssues.data.filter(
    (issue) => !bountyIssueUrls.includes(issue.html_url) && !issue.pull_request
  );

  return json({ user, issues });
};
