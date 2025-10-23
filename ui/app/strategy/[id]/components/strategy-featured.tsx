"use client"

export function FeaturedStrategies() {
  const featured = [
    {
      title: "Plasma Strategy",
      desc: "Explore trading strategies on Plasma chain with advanced AI optimization and auto-balancing yield execution.",
      image: "https://images.unsplash.com/photo-1643000867361-cd545336249b?auto=format&fit=crop&w=1920&q=80",
      label: "Plasma",
    },
    {
      title: "Point Farming",
      desc: "Collect ecosystem points seamlessly across top DeFi protocols, all simplified into one unified dashboard.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
      label: "Point",
    },
    {
      title: "HyperEVM Point Farming",
      desc: "Farm HyperEVM ecosystem points effortlessly with INFINIT protocol and adaptive AI task routing.",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1920&q=80",
      label: "Point",
    },
  ];

  return (
    <div className="mb-16">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
          Explore DeFi Strategies Powered by
        </h1>
        <h2 className="text-3xl md:text-4xl font-semibold text-cyan-500 mt-2">
          OceanFIN AI Agent Swarm
        </h2>
      </div>

      {/* Featured Cards */}
      <h1 className="text-xl font-semibold mb-4 text-foreground">
        Featured Strategies
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {featured.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition bg-card h-[400px]"
          >
            {/* Image*/}
            <div className="relative flex-shrink-0 h-[60%] w-full overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between flex-grow p-5 bg-white dark:bg-gray-900">
              <div>
                <span className="inline-block text-xl font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 px-2 py-0.5 rounded-full mb-2">
                  {item.label}
                </span>

                <h4 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                  {item.title}
                </h4>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
