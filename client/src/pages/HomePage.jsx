import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import { useLanguage } from "../components/utils/LanguageContext";
import translatedContents from "../data/translated_contents.json";

import CeoImage from "../assets/ceo.jpg";
import BuildingHeader from "../assets/building_header.jpg";
import HeroSlider1 from "../assets/hero_slider_1.jpg";
import HeroSlider2 from "../assets/hero_slider_2.jpg";
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

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderImages = [BuildingHeader, HeroSlider1, HeroSlider2];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  // Auto-play slider
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

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
      <div className="relative w-full min-h-[85vh] lg:min-h-190 flex flex-col lg:flex-row overflow-hidden group/hero">
        
        {/* Slider Backgrounds */}
        <div className="absolute inset-0 z-0">
          {sliderImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-top transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url(${img})`,
              }}
            ></div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
            onClick={prevSlide}
            className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/20 hover:bg-amber-500/80 text-white rounded-full transition-all duration-300 backdrop-blur-sm group opacity-0 group-hover/hero:opacity-100 -translate-x-10 group-hover/hero:translate-x-0"
            aria-label="Previous Slide"
        >
            <ArrowRight className="w-6 h-6 rotate-180" />
        </button>
        <button 
            onClick={nextSlide}
            className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/20 hover:bg-amber-500/80 text-white rounded-full transition-all duration-300 backdrop-blur-sm group opacity-0 group-hover/hero:opacity-100 translate-x-10 group-hover/hero:translate-x-0"
             aria-label="Next Slide"
        >
            <ArrowRight className="w-6 h-6" />
        </button>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/40 z-10 pointer-events-none"></div>

        {/* Content Section */}
        <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col justify-center items-start px-6 md:px-12 lg:px-20 py-20 lg:py-0 gap-8 h-full min-h-[inherit]">
          <div className="flex flex-col gap-4 animate-fade-in-up mt-auto mb-auto lg:mt-0 lg:mb-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium uppercase tracking-wider w-fit backdrop-blur-sm">
              <span>Official Portal</span>
            </div>
            <h1 className="font-goldman w-80 text-4xl sm:text-5xl md:w-120 lg:text-6xl lg:w-150 xl:text-7xl xl:w-180 font-bold leading-tight text-white drop-shadow-lg max-w-4xl">
              {t.landing.welcome_section.title[language]}
            </h1>
            <p className="text-gray-200 text-lg sm:text-xl font-light leading-relaxed max-w-lg drop-shadow-md">
              {t.landing.welcome_section.description[language]}
            </p>
          
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up delay-100 mt-6">
              <Link
                to="/departments"
                className="group relative px-8 py-4 bg-amber-500 text-gray-900 rounded-xl font-goldman flex items-center font-medium overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-1 text-center sm:text-left"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <span>{t.landing.departments_cta[language]}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>
  
              <Link
                to="/contacts"
                className="group px-8 py-4 bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-xl font-goldman font-medium shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 text-center sm:text-left"
              >
                <span>{t.landing.contact_cta[language]}</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Latest News */}
      <div className="w-full bg-[#F7F7F7] flex flex-col items-center gap-12 py-16 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2 font-goldman font-bold text-center">
          <h1 className="text-3xl md:text-5xl text-gray-900">
            {t.latest_news.title[language]}
          </h1>
          <p className="font-normal text-sm md:text-lg text-gray-500 max-w-2xl">
            {t.latest_news.subtitle[language]}
          </p>
        </div>

        <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
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
                className="w-full h-full animate-fade-in-up delay-200"
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
