import { Link } from "@remix-run/react";
import { formatName } from "~/lib/issues";

export default function Project({
  id,
  company,
  project,
  bounties,
  admin = false,
}) {
  return (
    <>
      <div className="bg-gray-50 border border-gray-100 rounded-lg px-7 py-4 mb-4">
        <div className="flex">
          <h1 className="font-heading text-xl mb-6">
            {company} <span className="text-gray-300">/ {project}</span>
          </h1>
          {admin && (
            <div className="ml-auto mt-1 space-x-8">
              <Link className="text-xs text-gray-500" to="/review">
                Review submissions
              </Link>
              <Link
                className="text-xs text-gray-500 ml-auto"
                to={"/new/" + id}
              >
                New bounty
              </Link>
            </div>
          )}
        </div>
        {bounties.filter((bounty) => bounty.type === "CHALLENGE").length >
          0 && (
          <>
            <h2 className="font-medium text-lg text-gray-950 mb-2">
              Challenges
            </h2>
            <div className="grid grid-cols-3 gap-5">
              {bounties
                .filter((bounty) => bounty.type === "CHALLENGE")
                .map((bounty) => (
                  <Bounty
                    key={bounty.id}
                    id={bounty.id}
                    name={bounty.name}
                    value={bounty.value}
                    description={bounty.description}
                    submissions={bounty.submissions}
                    assignees={bounty.assignees}
                  />
                ))}
            </div>
          </>
        )}

        {bounties.filter((bounty) => bounty.type === "BOUNTY").length > 0 && (
          <>
            <h2 className="font-medium text-lg text-gray-950 mb-2">Bounties</h2>
            <div className="grid grid-cols-3 gap-5">
              {bounties
                .filter((bounty) => bounty.type === "BOUNTY")
                .map((bounty) => (
                  <Bounty
                    key={bounty.id}
                    id={bounty.id}
                    name={bounty.name}
                    value={bounty.value}
                    description={bounty.description}
                    submissions={bounty.submissions}
                    assignees={bounty.assignees}
                  />
                ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export function Bounty({
  id,
  name,
  value,
  description,
  submissions,
  assignees,
  fullWidth = false,
}) {
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function stripAndTruncate(text: string): string {
    const markdownAndHtmlRegex =
      /(\*\*|__)(.*?)\1|(`{3}.*?`{3}|`{1}.*?`{1})|(\[.*?\]\(.*?\))|(^#+\s+)|(<[^>]+>)/gms;
    let strippedText = text.replace(markdownAndHtmlRegex, "");

    const maxLength = 180;
    if (strippedText.length > maxLength) {
      // Truncate and add an ellipsis
      strippedText = strippedText.substring(0, maxLength - 3) + "...";
    }
    return strippedText;
  }

  return (
    <Link
      to={"/bounty/" + id}
      className={
        "relative bg-white rounded-lg border border-gray-100 hover:border-gray-200 border-b-4 p-4" +
        (fullWidth ? " w-full" : "")
      }
    >
      <div className="flex">
        <h3 className="font-medium text-gray-950 mb-1">
          {formatName(name, true)}
        </h3>
        <span
          className={
            "ml-auto mb-1" +
            (submissions && submissions.length > 0
              ? " text-gray-500"
              : " text-orange-500")
          }
        >
          ${numberWithCommas(value)}
        </span>
        {submissions && submissions.length > 0 && (
          <span className="absolute bg-gray-100 rounded-tl-lg rounded-br text-gray-500 font-heading text-xs px-3 py-1.5 bottom-0 right-0">
            Submitted
          </span>
        )}
        {assignees.length > 0 && submissions && submissions.length === 0 && (
          <span className="absolute bg-gray-50 rounded-tl-lg rounded-br text-gray-300 font-heading text-xs px-3 py-1.5 bottom-0 right-0">
            {assignees.length} person working on this
          </span>
        )}
      </div>
      <p className="text-gray-500 text-xs overflow-x-hidden">
        {stripAndTruncate(description)}
      </p>
    </Link>
  );
}
