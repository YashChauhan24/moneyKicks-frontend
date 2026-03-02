import { motion } from "framer-motion";

const BouncingMoney = () => {
  const moneyItems = [
    { emoji: "💵", delay: 0, x: 20, size: "text-5xl" },
    { emoji: "💰", delay: 0.2, x: 80, size: "text-6xl" },
    { emoji: "💵", delay: 0.4, x: 140, size: "text-4xl" },
    { emoji: "💰", delay: 0.6, x: 60, size: "text-5xl" },
    { emoji: "💵", delay: 0.8, x: 120, size: "text-4xl" },
    { emoji: "🪙", delay: 0.3, x: 100, size: "text-3xl" },
    { emoji: "💲", delay: 0.5, x: 40, size: "text-4xl" },
  ];

  return (
    <div className="relative w-48 h-80 flex items-end justify-center">
      {moneyItems.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute ${item.size}`}
          style={{ left: item.x }}
          initial={{ y: 0 }}
          animate={{ 
            y: [-20, -60, -20],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 1.5,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default BouncingMoney;
