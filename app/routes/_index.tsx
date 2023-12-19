import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Project from "~/components/Project";
import Shell from "~/components/Shell";
import { authenticator } from "~/lib/auth.server";
import prisma from "~/lib/prisma";

export const meta: MetaFunction = () => {
  return [
    { title: "Muddle" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function action({ request }) {
  await authenticator.logout(request, { redirectTo: "/login" });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  const stats = [
    { name: "Up for grabs", value: "$36,192", image: "illustrations/card.svg" },
    { name: "New bounties", value: 3, image: "illustrations/bell.svg" },
    { name: "Completed bounties", value: 4, image: "illustrations/chart.svg" },
  ];

  return (
    <Shell heading="Dashboard" user={data.user}>
      <div className="flex mb-8 bg-orange-400 text-white border border-orange-800 rounded-lg px-8 py-4 text-sm">
        <div className="w-1/2 pt-4">
          <h1 className="font-heading text-3xl">
            Start hacking and earning rewards
          </h1>
          <p className="text-orange-100">
            We&apos;re stoked to have you join the Muddle community! You can get
            started by completing your profile, then you can view all open
            bounties on this page or head to the explore page to discover
            something specific.
          </p>
        </div>
        <div className="ml-auto">
          <img src="/illustrations/card.svg" alt="Card" className="w-32 h-32" />
        </div>
      </div>
      {/* <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="flex border border-gray-100 border-b-4 rounded-lg px-7 py-4"
          >
            <img className="w-12" src={stat.image} alt="Credit Card" />
            <div className="ml-4">
              <h2 className="font-heading text-lg">{stat.value}</h2>
              <p className="text-gray-500 text-xs">{stat.name}</p>
            </div>
          </div>
        ))}
      </div> */}
      {data.companies.map((company) => (
        <div key={company.id}>
          {company.projects.map((project) => {
            return (
              <Project
                key={project.id}
                id={project.id}
                company={company.name}
                project={project.name}
                challenges={project.bounties.filter(
                  (bounty) => bounty.type === "CHALLENGE"
                )}
                bounties={project.bounties.filter(
                  (bounty) => bounty.type === "BOUNTY"
                )}
              />
            );
          })}
        </div>
      ))}
    </Shell>
  );
}

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const companies = await prisma.company.findMany({
    include: {
      projects: {
        include: {
          bounties: {
            include: {
              submissions: true,
            }
          },
        },
      },
    },
  });

  return json({ companies, user });
}
