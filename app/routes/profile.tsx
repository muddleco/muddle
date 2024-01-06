import { json, type MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { sha256 } from "js-sha256";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Shell from "~/components/Shell";
import { authenticator } from "~/lib/auth.server";
import prisma from "~/lib/prisma";
import { getLevel, getLevelName, getRemainingXP } from "~/lib/xp";

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

  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const github = formData.get("github");

  await prisma.user.update({
    where: { email: user.email },
    data: { name, email, github },
  });

  // If user's email is changed, log them out
  if (user.email !== email) {
    await authenticator.logout(request, { redirectTo: "/login" });
  }

  return json({ message: "Profile updated" }, { status: 200 });
}

export default function Profile() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData();

  useEffect(() => {
    if (actionData && actionData.message) {
      toast.success("Profile updated successfully");
    }
  }, [actionData]);

  return (
    <Shell heading="Profile" user={data.user}>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-gray-100 border-b-4 rounded-lg px-7 py-8 text-center">
          <img
            src={
              "https://gravatar.com/avatar/" +
              sha256(data.user?.email) +
              "?d=robohash"
            }
            alt="Avatar"
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
          <h1 className="font-heading text-xl">{data.user?.name}</h1>
          <p className="text-gray-300 text-sm">
            {getLevelName(data.userData?.xp)}
          </p>
          <div className="my-8">
            <div className="bg-gray-50 border border-gray-100 rounded-full h-3 w-full">
              <div
                className="bg-orange-500 rounded-full h-3"
                style={{ width: `${((data.userData?.xp % 100) / 100) * 100}%` }}
              ></div>
            </div>
            <div className="flex mt-2">
              <p className="text-gray-500 font-medium text-xs">
                Level {getLevel(data.userData?.xp)}
              </p>
              <p className="text-gray-300 text-xs ml-auto">
                {getRemainingXP(data.userData?.xp)} XP remaining
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-2 border border-gray-100 border-b-4 rounded-lg px-7 py-4">
          <h2 className="font-heading text-xl">Update your details</h2>
          <Form className="mt-4 grid grid-cols-2 gap-4" method="POST">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your name
              </label>
              <input
                name="name"
                type="text"
                defaultValue={data.userData?.name || "John Doe"}
                placeholder="John Doe"
                className="border border-gray-100 rounded-lg px-3 py-1 text-gray-500 w-full outline-orange-500"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your email
              </label>
              <input
                name="email"
                type="text"
                defaultValue={data.userData?.email}
                placeholder="john@example.com"
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
                defaultValue={data.userData?.github || "johndoe"}
                placeholder="johndoe"
                className="border border-gray-100 rounded-lg px-3 py-1 text-gray-500 w-full outline-orange-500"
              />
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2 text-xs"
              >
                Update profile
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
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const userData = await prisma.user.findUnique({
    where: { email: user.email },
  });

  return json({ user, userData });
}
