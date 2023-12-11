import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { sha256 } from "js-sha256";
import Shell from "~/components/Shell";
import { authenticator } from "~/lib/auth.server";
import { getLevel, getLevelName, getRemainingXP } from "~/lib/xp";

export const meta: MetaFunction = () => {
  return [
    { title: "Muddle" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Profile() {
  const data = useLoaderData<typeof loader>();

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
          <p className="text-gray-300 text-sm">{getLevelName(data.userData?.xp)}</p>
          <div className="my-8">
            <div className="bg-gray-50 border border-gray-100 rounded-full h-3 w-full">
              <div className="bg-orange-500 rounded-full h-3" style={{width: `${(data.userData?.xp % 100) / 100 * 100}%`}}></div>
            </div>
            <div className="flex mt-2">
              <p className="text-gray-500 font-medium text-xs">Level {getLevel(data.userData?.xp)}</p>
              <p className="text-gray-300 text-xs ml-auto">{getRemainingXP(data.userData?.xp)} XP remaining</p>
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

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const userData = await prisma.user.findUnique({
    where: { email: user.email },
  });

  return json({ user, userData });
}
