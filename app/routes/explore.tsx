import { json, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
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

const featured = [
  {
    name: "Cal.com",
    slug: "cal",
    description: "Scheduling infrastructure for absolutely everyone.",
    image:
      "https://github.com/calcom/cal.com/assets/8019099/407e727e-ff19-4ca4-bcae-049dca05cf02",
  },
  {
    name: "Documenso",
    slug: "documenso",
    description: "Enabling everyone to sign documents, everywhere.",
    image:
      "https://github.com/documenso/documenso/assets/1309312/d7b86c0f-a755-4476-a022-a608db2c4633",
  },
];

export default function Explore() {
  const data = useLoaderData<typeof loader>();

  return (
    <Shell heading="Explore" user={data.user}>
      <section className="grid grid-cols-2 space-x-4 mb-8">
        {featured.map((project) => (
          <Link to={"/" + project.slug} className="relative group" key={project.name}>
            <img
              className="rounded-lg border border-gray-100 group-hover:border-gray-200"
              src={project.image}
              alt={project.name}
            />
            <div className="absolute bottom-0 bg-white group-hover:bg-gray-50 w-full px-4 py-2 rounded-b-lg border border-gray-100 group-hover:border-gray-200">
              <h1 className="font-heading text-lg">{project.name}</h1>
              <p className="text-gray-500 text-xs">{project.description}</p>
            </div>
          </Link>
        ))}
      </section>
      <section className="mb-8">
        <h1 className="font-heading text-xl mb-4">Browse by tag</h1>
        <div className="flex space-x-2">
          {data.tags.map((tag) => (
            <Link
              to={"/tag/" + tag}
              key={tag}
              className="bg-gray-50 border border-gray-100 rounded-lg py-0.5 px-2 text-sm text-gray-950"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>
      <section className="mb-8">
        <h1 className="font-heading text-xl mb-4">Browse by company</h1>
        <div className="grid grid-cols-3 gap-4">
          {data.companies.map((company) => (
            <Link
              key={company.id}
              to={"/" + company.slug}
              className="bg-white rounded-lg border border-gray-100 hover:border-gray-200 border-b-4 p-4"
            >
              <h3 className="font-medium text-gray-950 mb-1">{company.name}</h3>
              <p className="text-gray-500 text-xs">{company.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h1 className="font-heading text-xl mb-4">Highest value</h1>
        <div className="grid grid-cols-3 gap-4">
          {data.bounties.slice(0, 6).map((bounty) => (
            <Bounty
              key={bounty.id}
              id={bounty.id}
              name={bounty.name}
              value={bounty.value}
              description={bounty.description}
            />
          ))}
        </div>
      </section>
    </Shell>
  );
}

export async function loader({request}) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const projects = await prisma.project.findMany();
  const tags = projects.flatMap((project) => project.tags);
  const tagCounts = tags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  const bounties = await prisma.bounty.findMany({
    orderBy: {
      value: "desc",
    },
  });

  const companies = await prisma.company.findMany();

  return json({ tags: sortedTags, bounties, companies, user });
}
