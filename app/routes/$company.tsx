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

export default function Company() {
  const data = useLoaderData<typeof loader>();

  const allTags = Array.from(
    new Set(data.company?.projects.flatMap((project) => project.tags))
  );

  return (
    <Shell heading={data.company?.name} user={data.user}>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2 border border-gray-100 rounded-lg px-7 py-4 text-sm">
          <p className="font-heading text-lg text-gray-950">
            {data.company?.tagline}
          </p>
          <p className="text-gray-400">{data.company?.description}</p>
        </div>
        <div className="border border-gray-100 rounded-lg px-7 py-4 text-sm">
          <h2 className="font-heading text-lg mb-2">Tags</h2>
          <div className="flex flex-wrap">
            {allTags.map((tag) => (
              <div
                key={tag}
                className="mx-1 mb-2 bg-gray-50 border border-gray-100 rounded-lg py-0.5 px-2 text-sm text-gray-950"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
      {data.company?.projects.map((project) => {
        return (
          <Project
            key={project.id}
            company={data.company?.name}
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
    </Shell>
  );
}

export async function loader({ params, request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  
  const company = await prisma.company.findUnique({
    where: {
      slug: params.company,
    },
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

  return json({ company, user });
}
