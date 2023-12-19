// app/routes/login.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { authenticator } from "~/lib/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Muddle" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Login() {
  return (
    <>
      <div className="max-w-sm mx-auto mt-24 border border-gray-100 rounded-lg p-8 bg-gray-50">
        <div className="text-center mb-4">
          <Link to="/" className="font-heading text-xl text-gray-900">
            muddle
          </Link>
        </div>
        <h1 className="font-heading text-xl mb-8 text-center">
          Sign into your account
        </h1>
        <Form method="post">
          <input
            type="email"
            name="email"
            className="block w-full border border-gray-100 rounded-lg focus:outline-orange-500 px-2 py-1 text-sm"
            placeholder="john@example.com"
            required
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            className="mt-2 block w-full border border-gray-100 rounded-lg focus:outline-orange-500 px-2 py-1 text-sm"
            placeholder="••••••••"
            required
          />
          <button className="mt-4 w-full rounded-md bg-orange-500 px-2 py-2 text-xs font-medium text-white shadow-sm hover:bg-orange-500 focus-visible:outline">
            Sign In
          </button>
        </Form>
      </div>
      <p className="mt-8 text-center text-sm text-gray-300">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="text-orange-500 hover:text-orange-700 font-medium"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}

// Second, we need to export an action function, here we will use the
// `authenticator.authenticate method`
export async function action({ request }: ActionFunctionArgs) {
  // we call the method with the name of the strategy we want to use and the
  // request object, optionally we pass an object with the URLs we want the user
  // to be redirected to after a success or a failure
  return await authenticator.authenticate("user-pass", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
}

// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the
// dashboard if it is or return null if it's not
export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is already authenticated redirect to /dashboard directly
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}
