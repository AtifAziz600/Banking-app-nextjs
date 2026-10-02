import PlaidLink from "./PlaidLink";

const PageHeader = ({
  topTitle,
  bottomTitle,
  topDescription,
  bottomDescription,
  connectBank = false,
  user,
}: PageHeaderProps) => {
  return (
    <section className="transactions-header">
      <div className="flex flex-col gap-2">
        <h2 className="text-24 lg:text-30 font-semibold text-gray-900">
          {topTitle} <span className="text-bankGradient">{bottomTitle}</span>
        </h2>
        <p className="text-14 lg:text-16 font-normal text-gray-600">
          {topDescription} {bottomDescription}
        </p>
      </div>
      {connectBank && user && (
        <div className="flex flex-col gap-3">
          <PlaidLink user={user} variant="ghost" />
        </div>
      )}
    </section>
  );
};

export default PageHeader;
