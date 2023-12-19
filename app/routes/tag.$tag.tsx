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

export default function Explore() {
  const data = useLoaderData<typeof loader>();

  return (
    <Shell heading={"Browse by tag - " + data.tag} user={data.user}>
      {data.projects.map((project) => {
        return (
          <Project
            key={project.id}
            company={project.company?.name}
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

export async function loader({ request, params }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const projects = await prisma.project.findMany({
    where: {
      tags: {
        has: params.tag,
      },
    },
    include: {
      bounties: {
        include: {
          submissions: true,
        },
      },
      company: true,
    },
  });

  return json({ tag: params.tag, projects, user });
}
