import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Bounty } from "~/components/Project";
import Shell from "~/components/Shell";
import { authenticator } from "~/lib/auth.server";
import prisma from "~/lib/prisma";

export const meta: MetaFunction = () => {
  return [
    { title: "Muddle" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Tasks() {
  const data = useLoaderData<typeof loader>();

  return (
    <Shell heading="Tasks" user={data.user}>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-gray-100 border-b-4 rounded-lg px-7 py-8 text-center items-center flex">
          <div className="w-full">
            <h2 className="font-medium text-3xl text-gray-950 mb-2">
              {data.bounties.length || 0}
            </h2>
            <p className="text-gray-500">Bounties in progress</p>
          </div>
        </div>
        <div className="col-span-2 space-y-4 flex flex-wrap border border-gray-100 border-b-4 rounded-lg px-7 py-4">
          {!data.bounties.length && (
            <div className="w-full text-center pt-9">
              <p className="text-gray-500">No bounties in progress.</p>
            </div>
          )}
          {data.bounties.slice(0, 6).map((bounty) => (
            <Bounty
              key={bounty.id}
              id={bounty.id}
              name={bounty.name}
              value={bounty.value}
              description={bounty.description}
              submissions={bounty.submissions}
              assignees={bounty.assignees}
              fullWidth={true}
            />
          ))}
        </div>
      </div>
    </Shell>
  );
}

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const bounties = await prisma.bounty.findMany({
    where: {
      assignees: {
        some: {
          id: user?.id,
        },
      },
    },
    include: {
      submissions: true,
      assignees: true,
    }
  });

  return json({ bounties, user });
}
