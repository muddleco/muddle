import { json, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Shell from "~/components/Shell";
import prisma from "~/lib/prisma";

export const meta: MetaFunction = () => {
  return [
    { title: "Muddle" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Bounty() {
  const data = useLoaderData<typeof loader>();

  return (
    <Shell heading={data.bounty?.name}>
      <div className="grid grid-cols-3 gap-x-4">
        <div className="col-span-2 border border-gray-100 rounded-lg px-7 py-4 text-sm">
          <h2 className="font-heading text-xl mb-4">Description</h2>
          {data?.bounty?.description}
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-7 py-4 text-sm">
            <h2 className="font-heading text-xl mb-4">Reward</h2>
            <p className="text-gray-900 mb-4">
              An approved submission for this bounty will immediately receive ${data.bounty?.value}.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-7 py-4 text-sm">
            <h2 className="font-heading text-xl mb-4">GitHub</h2>
            <p className="text-gray-900 mb-4">
              View on GitHub &gt;
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-7 py-4 text-sm">
            <h2 className="font-heading text-xl mb-4">Submit</h2>
            <p className="font-medium text-gray-900 mb-4">
              If you&apos;re ready to submit your attempt at this bounty, please
              make sure the following is completed:
            </p>
            <ul className="text-gray-400 list-disc ml-4 text-xs space-y-4">
              <li>
                You have your GitHub username set correctly in your profile
              </li>
              <li>
                You have submitted an open pull request against the repository
              </li>
            </ul>
            <div className="mt-8 flex">
              <Link
                to={"/submit/" + data.bounty?.id}
                className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2 text-xs"
              >
                Submit a solution
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export async function loader({ params }) {
  const bounty = await prisma.bounty.findUnique({
    where: {
      id: params.bounty,
    },
    include: {
      project: {
        include: {
          company: true,
        },
      },
    },
  });

  return json({ bounty });
}
