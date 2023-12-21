import { json, redirect, type MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import Shell from "~/components/Shell";
import { authenticator } from "~/lib/auth.server";
import prisma from "~/lib/prisma";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);

export const meta: MetaFunction = () => {
  return [
    { title: "Muddle" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function action({ request }) {
  const form = await request.formData();
  const submission = form.get("submission");
  const action = form.get("action");

  if (action === "APPROVED") {
    // Approve the submission
    await prisma.submission.update({
      where: { id: submission },
      data: {
        status: action,
      },
    });

    // Get the bounty
    const newSubmission = await prisma.submission.findUnique({
      where: { id: parseInt(submission) },
      include: { bounty: true, user: true },
    });

    // Update the bounty status
    await prisma.bounty.update({
      where: { id: newSubmission?.bounty.id },
      data: {
        status: "CLOSED",
      },
    });

    if (
      newSubmission?.bounty.type === "BOUNTY" &&
      newSubmission?.bounty.value < 1000
    ) {
      // Send the reward
      const options = {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: "Bearer " + process.env.TREMENDOUS_TOKEN,
        },
        body: JSON.stringify({
          external_id: newSubmission?.id.toString(),
          payment: {
            funding_source_id: process.env.TREMENDOUS_FUNDING_SOURCE,
            channel: "API",
          },
          reward: {
            campaign_id: process.env.TREMENDOUS_CAMPAIGN_ID,
            value: {
              denomination: newSubmission?.bounty.value,
              currency_code: "USD",
            },
            recipient: {
              name: newSubmission?.user.name,
              email: newSubmission?.user.email,
            },
            delivery: { method: "EMAIL" },
          },
        }),
      };

      const res = await fetch(
        process.env.TREMENDOUS_PRODUCTION === "true"
          ? "https://www.tremendous.com/api/v2/orders"
          : "https://testflight.tremendous.com/api/v2/orders",
        options
      );
      return await res.json();
    }
  } else if (action === "REJECTED") {
    // Delete the submission
    await prisma.submission.delete({
      where: { id: submission },
    });
  }

  return redirect("/review");
}

export default function Review() {
  const data = useLoaderData<typeof loader>();

  return (
    <Shell heading="Review submissions" user={data.user}>
      <section>
        {data.submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <h1 className="font-heading text-3xl mb-4">No submissions yet</h1>
            <p className="text-gray-500">
              There are no submissions for you to review yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {data.submissions.map((submission) => (
              <div
                key={submission.id}
                className="border border-gray-100 rounded-lg p-5"
              >
                <h2 className="font-heading text-xl text-gray-900 mb-1">
                  {submission.bounty.name}
                </h2>
                <p className="text-gray-500 text-sm mb-1">
                  Submitted by {submission.user.name?.split(" ")[0]}{" "}
                  {dayjs(submission.createdAt).fromNow()}.
                </p>
                <a
                  href={submission.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 font-semibold text-xs"
                >
                  {submission.url}
                </a>
                <div className="flex mt-4 space-x-2">
                  <Form method="post">
                    <input
                      type="hidden"
                      name="submission"
                      value={submission.id}
                    />
                    <input type="hidden" name="action" value="APPROVED" />
                    <button className="text-center bg-orange-500 hover:bg-orange-600 text-white border border-gray-100 font-medium rounded-lg px-4 py-2 text-xs">
                      Approve
                    </button>
                  </Form>
                  <Form method="post">
                    <input
                      type="hidden"
                      name="submission"
                      value={submission.id}
                    />
                    <input type="hidden" name="action" value="REJECTED" />
                    <button className="text-center bg-white hover:bg-gray-50 text-gray-900 border border-gray-100 font-medium rounded-lg px-4 py-2 text-xs">
                      Reject
                    </button>
                  </Form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  if (user?.companyId === null) {
    return redirect("/");
  }
  const submissions = await prisma.submission.findMany({
    where: {
      AND: [
        {
          status: "SUBMITTED",
        },
        {
          bounty: {
            project: {
              companyId: user?.companyId,
            },
          },
        },
      ],
    },
    include: {
      bounty: true,
      user: true,
    },
  });

  return json({ submissions, user });
}
