import { json, redirect, type MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Shell from "~/components/Shell";
import { authenticator } from "~/lib/auth.server";
import prisma from "~/lib/prisma";
import { Octokit } from "octokit";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);

export const meta: MetaFunction = () => {
  return [
    { title: "Muddle" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function action({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  if (user?.companyId === null) {
    return redirect("/");
  }

  if (request.method === "POST") {
    const formData = await request.formData();
    const repo = formData.get("repo");

    const project = await prisma.project.create({
      data: {
        name: repo,
        slug: repo,
        repo,
        company: { connect: { id: user?.companyId } },
        tags: [],
      },
    });

    return json({ message: "Project created" }, { status: 200 });
  }

  if (request.method === "DELETE") {
    const formData = await request.formData();
    const projectId = formData.get("projectId");

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { bounties: true },
    });

    if (project?.bounties.length > 0) {
      return json({ message: "Project contains bounties" }, { status: 400 });
    }

    await prisma.project.delete({
      where: { id: projectId, companyId: user?.companyId },
    });

    return json({ message: "Project deleted" }, { status: 200 });
  }

  if (request.method === "PATCH") {
    const formData = await request.formData();
    const name = formData.get("name");
    const tagline = formData.get("tagline");
    const description = formData.get("description");
    const slug = formData.get("slug");
    const github = formData.get("github");

    await prisma.company.update({
      where: { id: user?.companyId },
      data: { name, tagline, description, slug, github },
    });

    return json({ message: "Company updated" }, { status: 200 });
  }
}

export default function Admin() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData();
  const octokit = new Octokit();

  async function fetchRepositories(username) {
    try {
      const response = await octokit.rest.repos.listForUser({
        username: username,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching repositories", error);
      return [];
    }
  }

  const [deleteConfirmed, confirmDelete] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [repositories, setRepositories] = useState([]);

  useEffect(() => {
    if (actionData && actionData.message === "Project created") {
      toast.success("Project created successfully");
      setModalOpen(false);
    }

    if (actionData && actionData.message === "Project deleted") {
      toast.success("Project deleted successfully");
    }

    if (actionData && actionData.message === "Project contains bounties") {
      toast.error(
        "The project contains bounties. Delete the bounties first before removing the project."
      );
    }

    if (actionData && actionData.message === "Company updated") {
      toast.success("Company updated successfully");
    }
  }, [actionData]);

  useEffect(() => {
    if (modalOpen && data.user?.company?.github) {
      fetchRepositories(data.user.company.github).then(setRepositories);
    }
  }, [modalOpen, data.user?.company?.github]);

  return (
    <Shell heading={data.user?.company?.name} user={data.user}>
      {/* Create project modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <div
            className="bg-white border border-gray-100 border-b-4 rounded-lg px-7 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="font-heading text-xl mb-4">Add a new project</h1>
            {!repositories.length && (
              <p className="text-gray-300 text-sm mb-4">
                We&apos;re fetching your repositories from GitHub. This may take
                a few seconds.
              </p>
            )}
            <div className="grid grid-cols-3 gap-4">
              {repositories
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .map((repo) => (
                  <Form key={repo.id} method="POST">
                    <input type="hidden" name="repo" value={repo.name} />
                    <button type="submit" className="border border-gray-100 hover:border-gray-200 border-b-4 rounded-lg px-4 py-2 text-left">
                      <h1 className="font-heading text-gray-700 text-xl mb-1">
                        <span className="text-gray-400">
                          {data.user?.company?.github}/
                        </span>
                        {repo.name}
                      </h1>
                      <p className="text-gray-300 text-xs">
                        {repo.stargazers_count} stars - Created{" "}
                        {dayjs(repo.created_at).fromNow()}
                      </p>
                    </button>
                  </Form>
                ))}
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div>
          <div className="border border-gray-100 border-b-4 rounded-lg text-center">
            <img
              src={
                "https://github.com/calcom/cal.com/assets/8019099/407e727e-ff19-4ca4-bcae-049dca05cf02"
              }
              alt="Cal.com"
              className="w-full rounded-t-lg mx-auto mb-4"
            />
            <div className="px-7 py-4">
              <h1 className="font-heading text-xl">
                {data.user?.company?.name}
              </h1>
              <p className="text-gray-300 text-sm">
                {data.user?.company?.tagline}
              </p>
            </div>
            <div className="px-7 py-4 grid grid-cols-3 mb-4">
              <div className="pr-2">
                <h3 className="font-heading text-xl">
                  {data.user?.company?.projects.length}
                </h3>
                <p className="text-gray-300 text-sm">Bounties</p>
              </div>
              <div className="col-span-2 border-l pl-2">
                <h3 className="font-heading text-xl">
                  {dayjs(data.user?.company?.createdAt).fromNow(true)}
                </h3>
                <p className="text-gray-300 text-sm">Time on Muddle</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <div className="border border-gray-100 border-b-4 rounded-lg px-7 py-4 mb-4">
            <div className="flex">
              <h2 className="font-heading text-xl">
                {data.user?.company?.name}&apos;s projects
              </h2>
              <button
                onClick={() => setModalOpen(!modalOpen)}
                className="ml-auto mt-1 text-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-3 py-1 text-xs"
              >
                New project
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-y-4">
              {data.user?.company?.projects.map((project) => (
                <div
                  key={project.id}
                  className="flex border border-gray-100 border-b-4 rounded-lg px-4 py-2"
                >
                  <div>
                    <h3 className="font-heading text-gray-700 text-lg">
                      {project.name}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {data.user?.company?.github}/{project.repo}
                    </p>
                  </div>
                  <div className="ml-auto flex self-center text-sm text-orange-500 font-medium">
                    {deleteConfirmed !== project.id && (
                      <button onClick={() => confirmDelete(project.id)}>
                        Delete
                      </button>
                    )}
                    {deleteConfirmed === project.id && (
                      <Form method="DELETE">
                        <input
                          type="hidden"
                          name="projectId"
                          value={project.id}
                        />
                        <button type="submit">Confirm deletion</button>
                      </Form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-gray-100 border-b-4 rounded-lg px-7 py-4">
            <h2 className="font-heading text-xl">
              Update your company&apos;s details
            </h2>
            <Form className="mt-4 grid grid-cols-2 gap-4" method="PATCH">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Company name
                </label>
                <input
                  name="name"
                  type="text"
                  defaultValue={data.user?.company?.name || "Cal.com"}
                  placeholder="Cal.com"
                  className="border border-gray-100 rounded-lg px-3 py-1 text-gray-500 w-full outline-orange-500"
                />
              </div>
              <div>
                <label
                  htmlFor="tagline"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tagline
                </label>
                <input
                  name="tagline"
                  type="text"
                  defaultValue={data.user?.company?.tagline || ""}
                  placeholder="Scheduling infrastructure for absolutely everyone."
                  className="border border-gray-100 rounded-lg px-3 py-1 text-gray-500 w-full outline-orange-500"
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <input
                  name="description"
                  type="text"
                  defaultValue={data.user?.company?.description || ""}
                  placeholder="A longer description."
                  className="border border-gray-100 rounded-lg px-3 py-1 text-gray-500 w-full outline-orange-500"
                />
              </div>
              <div className="bg-orange-50 border border-orange-100 col-span-2 mt-2 p-5 rounded-lg grid grid-cols-2 gap-4">
                <div className="col-span-2 mb-2">
                  <h3 className="text-lg font-heading text-orange-900">
                    Danger zone
                  </h3>
                  <p className="text-sm text-orange-800">
                    Be careful when updating these things, as it may break
                    existing links and references.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Slug
                  </label>
                  <input
                    name="slug"
                    type="text"
                    defaultValue={data.user?.company?.slug || ""}
                    placeholder="cal"
                    className="border border-gray-100 rounded-lg px-3 py-1 text-gray-500 w-full outline-orange-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="github"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    GitHub username
                  </label>
                  <input
                    name="github"
                    type="text"
                    defaultValue={data.user?.company?.github || "calcom"}
                    placeholder="johndoe"
                    className="border border-gray-100 rounded-lg px-3 py-1 text-gray-500 w-full outline-orange-500"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2 text-xs"
                >
                  Update company
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
      <Toaster />
    </Shell>
  );
}

export async function loader({ request }) {
  const authenticatedUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await prisma.user.findUnique({
    where: { id: authenticatedUser?.id },
    include: {
      company: {
        include: { projects: true },
      },
    },
  });

  if (user?.companyId === null) {
    return redirect("/");
  }

  return json({ user });
}
