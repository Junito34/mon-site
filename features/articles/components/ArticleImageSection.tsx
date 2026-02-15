import ImageSection from "@/features/articles/components/ImageSection";

export default function ArticleImageSection({
  image,
  title,
}: {
  image: string;
  title?: string | null;
}) {
  return (
    <div className="my-10">
      <ImageSection
        image={image}
        title={title ?? undefined}
        fit="contain"        
      />
    </div>
  );
}