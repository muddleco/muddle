import { json, redirect, type MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Shell from "~/components/Shell";
import { authenticator } from "~/lib/auth.server";
import prisma from "~/lib/prisma";
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

export default function Admin() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData();

  useEffect(() => {
    if (actionData && actionData.message) {
      toast.success("Company updated successfully");
    }
  }, [actionData]);

  return (
    <Shell heading={data.user?.company?.name} user={data.user}>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-gray-100 border-b-4 rounded-lg text-center">
          <img
            src={
              "https://github.com/calcom/cal.com/assets/8019099/407e727e-ff19-4ca4-bcae-049dca05cf02"
            }
            alt="Cal.com"
            className="w-full rounded-t-lg mx-auto mb-4"
          />
          <div className="px-7 py-4">
            <h1 className="font-heading text-xl">{data.user?.company?.name}</h1>
            <p className="text-gray-300 text-sm">
              {data.user?.company?.tagline}
            </p>
          </div>
          <div className="px-7 py-4 grid grid-cols-3">
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
        <div className="col-span-2 border border-gray-100 border-b-4 rounded-lg px-7 py-4">
          <h2 className="font-heading text-xl">
            Update your company&apos;s details
          </h2>
          <Form className="mt-4 grid grid-cols-2 gap-4" method="POST">
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
