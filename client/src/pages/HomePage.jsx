import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import { useLanguage } from "../components/utils/LanguageContext";
import translatedContents from "../data/translated_contents.json";

import CeoImage from "../assets/ceo.jpg";
import BuildingHeader from "../assets/building_header.jpg";
import Subtract from "../assets/subtract.png";

import ArrowRight from "../assets/icons/arrow_right.svg?react";

import SheildIcon from "../assets/icons/sheild_icon.svg?react";
import BoltIcon from "../assets/icons/bolt_icon.svg?react";
import GlobeIcon from "../assets/icons/globe_icon1.svg?react";
import CompliantIcon from "../assets/icons/compliant_icon.svg?react";
import LidetaBuilding from "../assets/icons/lideta_building.svg";

import NewsCard from "../components/ui/NewsCard";
import CutoutCard from "../components/ui/CutoutCard";
import Loading from "../components/ui/Loading";

function HomePage() {
  const { language } = useLanguage();
  const t = translatedContents;
  const [latestNews, setLatestNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getNews() {
      try {
        const response = await fetch("/api/news");
        if (response.ok) {
          const data = await response.json();
          // Format the data to match expected structure
          const formattedNews = data.map((item) => ({
            id: item.id.toString(),
            title: item.title,
            description:
              item.short_description ||
              item.description?.substring(0, 100) ||
              "",
            date: item.formatted_date || item.created_at?.split("T")[0] || "",
            category: item.category,
            photo: item.photo,
            amh: item.amh,
            orm: item.orm,
          }));

          if (Array.isArray(formattedNews)) {
            console.log(formattedNews)
            setLatestNews(formattedNews.slice(0, 4));
          }
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getNews();
  }, []);

  return (
    <div className="w-full flex flex-col gap-16">
      {/* Hero */}
      <div
        className="relative w-full min-h-[85vh] lg:min-h-screen flex flex-col lg:flex-row overflow-hidden bg-cover bg-top"
        style={{
          backgroundImage: `url(${BuildingHeader})`,
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/40 z-0"></div>

        {/* Content Section */}
        <div className="relative z-10 w-full flex flex-col justify-center items-start px-6 md:px-12 lg:px-30 py-12 lg:py-0 gap-8">
          <div className="flex flex-col gap-4 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium uppercase tracking-wider w-fit backdrop-blur-sm">
              <span>Official Portal</span>
            </div>
            <h1 className="font-goldman text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-white drop-shadow-lg">
              {t.landing.welcome_section.title[language]}
            </h1>
            <p className="text-gray-200 text-lg sm:text-xl font-light leading-relaxed max-w-lg drop-shadow-md">
              {t.landing.welcome_section.description[language]}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up delay-100">
            <Link
              to="/departments"
              className="group relative px-8 py-4 bg-amber-500 text-gray-900 rounded-xl font-goldman font-medium overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <span>{t.landing.departments_cta[language]}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>

            <Link
              to="/contacts"
              className="group px-8 py-4 bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-xl font-goldman font-medium shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <span>{t.landing.contact_cta[language]}</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </Link>
          </div>
        </div>

        <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-auto flex items-end justify-center lg:justify-end px-4 lg:px-0 z-10">
          {/* Decorative Background Elements - Premium Refinement */}
          {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] pointer-events-none z-0 overflow-hidden flex justify-center items-center"> */}
            {/* Main Aura */}
            {/* <div className="absolute w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute w-[300px] h-[300px] bg-amber-400/10 rounded-full blur-[60px]"></div> */}

            {/* Architectural Rings - Solid & Elegant */}
            {/* <div className="absolute w-[80%] pb-[80%] border-[1px] border-amber-500/20 rounded-full animate-[spin_30s_linear_infinite]"></div>
            <div className="absolute w-[65%] pb-[65%] border-[1px] border-white/10 rounded-full animate-[spin_25s_linear_infinite_reverse]"></div>
            <div className="absolute w-[95%] pb-[95%] border-[1px] border-amber-500/5 rounded-full"></div> */}

            {/* Floating Accents */}
            {/* <div className="absolute top-[20%] right-[20%] w-2 h-2 bg-amber-400/60 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-bounce-slow"></div>
            <div className="absolute bottom-[30%] left-[20%] w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse"></div>
          </div>

          <div className="relative h-[90%] w-full max-w-lg lg:max-w-xl flex items-end justify-center z-10"> */}
            {/* Rim Light / Back Glow for Pop */}
            {/* <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-50 pointer-events-none mix-blend-overlay"></div>

            <img
              src={CeoImage}
              alt="CEO"
              className="object-cover object-top h-full w-auto drop-shadow-2xl animate-fade-in-up delay-200 mask-image-gradient-bottom grayscale-[10%] contrast-110 brightness-100"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to right, transparent 0%, black 15%, black 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to right, transparent 0%, black 15%, black 100%)",
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            /> */}

            {/* Premium Glassmorphic Name Card */}
            {/* <div className="absolute bottom-12 -left-4 md:-left-8 bg-black/40 backdrop-blur-xl border border-amber-500/30 p-5 pr-10 rounded-xl shadow-2xl flex items-center gap-5 animate-fade-in-up delay-500 max-w-[320px] group transition-all duration-300 hover:border-amber-500/50 hover:bg-black/50">
              <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-amber-500/60 rounded-tl-lg"></div>
              <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-amber-500/60 rounded-br-lg"></div>

              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-gray-900 font-bold text-2xl shadow-[0_0_15px_rgba(245,158,11,0.4)] ring-2 ring-white/10">
                <span className="font-goldman">L</span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-white font-goldman font-bold text-lg leading-tight tracking-wide drop-shadow-lg">
                  Hon. Administrator
                </h3>
                <div className="h-[1px] w-12 bg-amber-500/50 my-1"></div>
                <p className="text-amber-200 text-[11px] font-bold uppercase tracking-widest">
                  Lideta Sub-City
                </p>
              </div>
            </div> */}
          {/* </div> */}
        </div>
      </div>

      {/* Latest News */}
      <div className="w-full bg-[#F7F7F7] flex flex-col items-center gap-8 py-10 px-4 md:px-6 lg:px-12">
        <div className="flex flex-col items-center gap-2 font-goldman font-bold text-center">
          <h1 className="text-3xl md:text-4xl">
            {t.latest_news.title[language]}
          </h1>
          <p className="font-normal text-sm md:text-base text-gray-600">
            {t.latest_news.subtitle[language]}
          </p>
        </div>

        <div className="w-full max-w-3xl flex flex-wrap justify-center items-center gap-6 lg:gap-4 lg:flex-nowrap xl:gap-8 ">
          {
            isLoading ? (
              <Loading />
            ) : (
            latestNews.map((news) => {
            let title = news.title;
            let description = news.description;
            let category = news.category;

            if (language === "am" && news.amh) {
              title = news.amh.title || title;
              description =
                news.amh.short_description ||
                news.amh.description?.substring(0, 100) ||
                description;
              category = news.amh.category || category;
            } else if (language === "or" && news.orm) {
              title = news.orm.title || title;
              description =
                news.orm.short_description ||
                news.orm.description?.substring(0, 100) ||
                description;
              category = news.orm.category || category;
            }

            return (
              <div
                key={news.id}
                className="w-full sm:w-[320px] md:w-[360px] lg:w-[380px] animate-fade-in-up delay-200 "
              >
                <NewsCard
                  id={news.id}
                  title={title}
                  description={description}
                  date={news.date}
                  category={category}
                  photo={news.photo}
                />
              </div>
            );
          }))}
        </div>
      </div>

      {/* Additional Services */}
      <div className="w-full bg-[#F7F7F7] flex flex-col items-center gap-8 py-10 px-4 md:px-6 lg:px-12">
        <div className="flex flex-col items-center gap-2 font-goldman font-bold text-center">
          <h1 className="text-2xl md:text-3xl">
            {t.additional_services.title[language]}
          </h1>
          <p className="font-normal text-sm md:text-base text-gray-600">
            {t.additional_services.description[language]}
          </p>
        </div>

        <div className="w-full flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:justify-center lg:gap-10">
          <Link to="/news" className="flex justify-center w-full sm:w-auto">
            <CutoutCard
              title={
                t.additional_services.services.news_updates.title[language]
              }
              description={
                t.additional_services.services.news_updates.description[
                  language
                ]
              }
            />
          </Link>
          <Link to="/vaccancy" className="flex justify-center w-full sm:w-auto">
            <CutoutCard
              title={
                t.additional_services.services.job_opportunities.title[language]
              }
              description={
                t.additional_services.services.job_opportunities.description[
                  language
                ]
              }
            />
          </Link>
          <Link to="/events" className="flex justify-center w-full sm:w-auto">
            <CutoutCard
              title={t.additional_services.services.events.title[language]}
              description={
                t.additional_services.services.events.description[language]
              }
            />
          </Link>
        </div>
      </div>

      {/* Commitment */}
      <div className="w-full bg-[#F7F7F7] flex flex-col items-center gap-8 py-10 px-4 md:px-6 lg:px-12">
        <div className="flex flex-col items-center gap-2 font-goldman font-bold text-center">
          <h1 className="text-2xl md:text-3xl">
            {t.our_commitment.title[language]}
          </h1>
          <p className="font-normal text-sm md:text-base text-gray-600">
            {t.our_commitment.description[language]}
          </p>
        </div>

        <div className="w-full flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:justify-center lg:gap-10 lg:max-w-6xl ">
          <div className="w-full max-w-xs h-full mx-auto rounded-xl flex flex-col justify-center items-center gap-3 px-6 py-8 ">
            <div className="w-15 h-15 bg-amber-100 flex justify-center items-center rounded-md">
              <SheildIcon className="text-[#FACC14]" />
            </div>

            <p className="font-bold text-xl text-center">
              {t.commitment_cards.transparency.title[language]}
            </p>
            <p className="font-light text-sm md:text-base text-center text-gray-700">
              {t.commitment_cards.transparency.description[language]}
            </p>
          </div>

          <div className="w-full max-w-xs h-full mx-auto  rounded-xl flex flex-col justify-center items-center gap-3 px-6 py-8 ">
            <div className="w-15 h-15 bg-amber-100 flex justify-center items-center rounded-md">
              <BoltIcon />
            </div>

            <p className="font-bold text-xl text-center">
              {t.commitment_cards.efficient_service.title[language]}
            </p>
            <p className="font-light text-sm md:text-base text-center text-gray-700">
              {t.commitment_cards.efficient_service.description[language]}
            </p>
          </div>

          <div className="w-full max-w-xs h-full mx-auto rounded-xl flex flex-col justify-center items-center gap-3 px-6 py-8 ">
            <div className="w-15 h-15 bg-amber-100 flex justify-center items-center rounded-md">
              <GlobeIcon />
            </div>

            <p className="font-bold text-xl text-center">
              {t.commitment_cards.innovation.title[language]}
            </p>
            <p className="font-light text-sm md:text-base text-center text-gray-700">
              {t.commitment_cards.innovation.description[language]}
            </p>
          </div>
        </div>
      </div>

      {/* Complaint CTA */}
      <div className="w-full px-4 md:px-6 lg:px-12 pb-24">
        <div className="w-full max-w-5xl mx-auto bg-[linear-gradient(180deg,_#484848_0%,_#3A3A3A_50%,_#1E1E1E_100%)] rounded-2xl flex flex-col items-center justify-around py-10 px-6 md:px-10 gap-6 shadow-lg">
          <CompliantIcon className="w-16 h-16 md:w-20 md:h-20" />

          <h1 className="font-bold text-3xl md:text-4xl text-white text-center">
            {t.complaints_section.title[language]}
          </h1>
          <p className="w-full md:w-3/4 font-light text-sm md:text-base text-white text-center">
            {t.complaints_section.description[language]}
          </p>
          <Link
            to="/compliants"
            className="w-full sm:w-56 h-12 border border-white rounded-xl font-bold text-white flex justify-center items-center gap-3 cursor-pointer "
          >
            <p>{t.complaints_section.cta_button[language]}</p>
            <ArrowRight className="text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
