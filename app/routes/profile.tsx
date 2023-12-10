import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Shell from "~/components/Shell";
import prisma from "~/lib/prisma";

export const meta: MetaFunction = () => {
  return [
    { title: "Muddle" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Profile() {
  const data = useLoaderData<typeof loader>();

  return (
    <Shell heading="Profile">
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-gray-100 border-b-4 rounded-lg px-7 py-8 text-center">
          <img
            src="https://avatars.githubusercontent.com/u/25907159?v=4"
            alt="Avatar"
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
          <h1 className="font-heading text-xl">{data.user?.name}</h1>
          <p className="text-gray-300 text-sm">PR Wizard</p>
          <div className="my-8">
            <div className="bg-gray-50 border border-gray-100 rounded-full h-3 w-full">
              <div className="bg-orange-500 rounded-full w-3/4 h-3"></div>
            </div>
            <div className="flex mt-2">
              <p className="text-gray-500 font-medium text-xs">Level 3</p>
              <p className="text-gray-300 text-xs ml-auto">965 XP remaining</p>
            </div>
          </div>
        </div>
        <div className="col-span-2 flex border border-gray-100 border-b-4 rounded-lg px-7 py-4">
          <h2 className="font-heading text-xl">Update your details</h2>
        </div>
      </div>
    </Shell>
  );
}

export async function loader() {
  const user = await prisma.user.findUnique({
    where: { id: "746faec6-042d-402c-a986-cbdca78ba938" },
  });

  return json({ user });
}
