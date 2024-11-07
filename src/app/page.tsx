import S3Browser from "@/components/S3Browser";

export default function Home() {
  return (
    <div className="max-w-[1200px] mx-auto p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <S3Browser />
    </div>
  );
}
