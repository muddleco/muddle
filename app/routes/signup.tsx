// app/routes/login.tsx
import {
  redirect,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import prisma from "~/lib/prisma";
import bcrypt from "bcryptjs";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  const name = form.get("name");
  const email = form.get("email");
  const password = form.get("password");
  const github = form.get("github");

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      github,
    },
  });

  // we return a redirect response to the user's profile page
  return redirect("/login");
}

export const meta: MetaFunction = () => {
  return [
    { title: "Muddle" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Signup() {
  return (
    <>
      <div className="max-w-sm mx-auto mt-24 border border-gray-100 rounded-lg p-8 bg-gray-50">
        <div className="text-center mb-4">
          <Link to="/" className="font-heading text-xl text-gray-900">
            muddle
          </Link>
        </div>
        <h1 className="font-heading text-xl mb-8 text-center">
          Create an account
        </h1>
        <Form method="post">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            className="block w-full border border-gray-100 rounded-lg focus:outline-orange-500 px-2 py-1 text-sm"
            placeholder="John Doe"
            required
          />
          <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            className="block w-full border border-gray-100 rounded-lg focus:outline-orange-500 px-2 py-1 text-sm"
            placeholder="john@example.com"
            required
          />
          <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            className="block w-full border border-gray-100 rounded-lg focus:outline-orange-500 px-2 py-1 text-sm"
            placeholder="••••••••"
            required
          />
          <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
            GitHub username
          </label>
          <input
            type="text"
            name="github"
            className="block w-full border border-gray-100 rounded-lg focus:outline-orange-500 px-2 py-1 text-sm"
            placeholder="john-doe"
            required
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-orange-500 px-2 py-2 text-xs font-medium text-white shadow-sm hover:bg-orange-500 focus-visible:outline"
          >
            Join the community
          </button>
        </Form>
      </div>
      <p className="mt-8 text-center text-sm text-gray-300">
        Already have an account?{" "}
        <a
          href="/login"
          className="text-orange-500 hover:text-orange-700 font-medium"
        >
          Log in
        </a>
      </p>
    </>
  );
}
