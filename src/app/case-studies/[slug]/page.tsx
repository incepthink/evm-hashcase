import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudyArticle from "@/components/home/CaseStudyArticle";
import HomeFooter from "@/components/home/HomeFooter";
import HomeNav from "@/components/home/HomeNav";
import HomeShell from "@/components/home/HomeShell";
import { CASE_STUDY_DETAILS, getCaseStudyDetail } from "@/components/home/caseStudyDetails";
import { CASE_STUDIES } from "@/components/home/content";

type Params = { params: Promise<{ slug: string }> };

const load = (slug: string) => {
  const d = getCaseStudyDetail(slug);
  const cs = CASE_STUDIES.find((c) => c.slug === slug);
  return d && cs ? { d, cs } : null;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return CASE_STUDY_DETAILS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = load((await params).slug);
  if (!found) return {};
  const title = `${found.cs.short} case study — HashCase`;
  return {
    title,
    description: found.d.intro,
    openGraph: { title, description: found.d.intro, type: "article" },
  };
}

export default async function CaseStudyPage({ params }: Params) {
  const found = load((await params).slug);
  if (!found) notFound();

  return (
    <HomeShell>
      <div aria-hidden="true" className="pointer-events-none absolute -right-[120px] -top-[220px] h-[620px] w-[620px] rounded-full bg-[#E4DCFF] opacity-70 blur-[110px]" />
      <HomeNav />
      <main className="relative z-[2]">
        <CaseStudyArticle cs={found.cs} d={found.d} />
      </main>
      <HomeFooter />
    </HomeShell>
  );
}
