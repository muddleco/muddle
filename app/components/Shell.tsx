import { Link, useMatches } from "@remix-run/react";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "My Tasks", href: "/tasks" },
  { name: "Profile", href: "/profile" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Shell({ children, heading }) {
  const matches = useMatches();
  return (
    <>
      <header className="text-gray-900 font-sans">
        <div className="mx-24 flex py-5 items-center">
          <Link
            to="/"
            className="flex font-heading text-xl text-gray-900 mb-4 md:mb-0"
          >
            muddle
          </Link>
          <nav className="md:ml-auto md:mr-auto flex flex-wrap items-center justify-center text-xs">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  matches[1].pathname === item.href
                    ? "bg-gray-100"
                    : "hover:bg-gray-100",
                  "mr-5 hover:text-gray-900 rounded-lg px-3 py-2"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="inline-flex">
            <img
              src="https://avatars.githubusercontent.com/u/25907159?v=4"
              alt="Avatar"
              className="w-6 h-6 rounded-full"
            />
          </div>
        </div>
      </header>
      <div className="mx-24 font-sans">
        <div className="my-8 flex">
          {matches[1].pathname.startsWith("/bounty/") && (
            <Link
              to="/"
              className="font-bold text-gray-300 hover:text-orange-500 text-2xl mr-2 mt-0.5"
            >
              &lt;
            </Link>
          )}
          <h1 className="font-heading text-3xl">{heading}</h1>
        </div>
        {children}
      </div>
      <div className="my-24 mx-24 text-gray-300 text-xs flex">
        <div>&copy; 2023 Muddle. All rights reserved.</div>
        <div className="ml-auto space-x-4">
          <Link to="/" className="hover:text-gray-800">Privacy</Link>
          <Link to="/" className="hover:text-gray-800">Terms</Link>
        </div>
      </div>
    </>
  );
}
