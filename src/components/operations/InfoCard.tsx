interface InfoCardProps {
  title: string;
  desc: string;
}

const InfoCard = ({ title, desc }: InfoCardProps) => {
  return (
    <div className="bg-secondary rounded-lg p-4">
      <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
};

export default InfoCard;

