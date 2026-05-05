import React from 'react';
import { PageBanner } from '../common/PageBanner';
import { DynamicImage } from '../common/DynamicImage';
import { Wine, Users, Calendar } from 'lucide-react';
import { useSiteTextContext } from '../../src/SiteTextContext';

export function Networking() {
  const { getText } = useSiteTextContext();

  return (
    <div className="min-h-screen">
      <PageBanner title="NETWORKING" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Title Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0B2447] mb-6">
              {getText('networking.title')}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              {getText('networking.intro')}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-16">
            {/* First Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <DynamicImage
                  imageKey="networking.event"
                  alt="DArt-B의 밤 이벤트"
                  className="w-full h-80 object-cover rounded-[10px] shadow-lg"
                  style={{ filter: 'drop-shadow(0px 0px 25px rgba(0,0,0,0.1))' }}
                />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Wine className="w-8 h-8 text-[#0B2447]" />
                  <h3 className="text-2xl font-bold text-[#0B2447]">
                    {getText('networking.section1.title')}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {getText('networking.section1.body')}
                </p>
              </div>
            </div>

            {/* Second Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-8 h-8 text-[#0B2447]" />
                  <h3 className="text-2xl font-bold text-[#0B2447]">
                    {getText('networking.section2.title')}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {getText('networking.section2.body')}
                </p>
              </div>
              <div className="order-1 md:order-2">
                <DynamicImage
                  imageKey="networking.activity"
                  alt="네트워킹 활동"
                  className="w-full h-80 object-cover rounded-[10px] shadow-lg"
                  style={{ filter: 'drop-shadow(0px 0px 25px rgba(0,0,0,0.1))' }}
                />
              </div>
            </div>

            {/* Third Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <DynamicImage
                  imageKey="networking.group"
                  alt="단체 사진"
                  className="w-full h-80 object-cover rounded-[10px] shadow-lg"
                  style={{ filter: 'drop-shadow(0px 0px 25px rgba(0,0,0,0.1))' }}
                />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-8 h-8 text-[#0B2447]" />
                  <h3 className="text-2xl font-bold text-[#0B2447]">
                    {getText('networking.section3.title')}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {getText('networking.section3.body')}
                </p>
              </div>
            </div>
          </div>

          {/* Highlight Box */}
          <div className="mt-16 bg-gradient-to-r from-[#0B2447] to-[#1a3a5c] rounded-[10px] p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              {getText('networking.highlight.title')}
            </h3>
            <p className="text-lg opacity-90 leading-relaxed">
              {getText('networking.highlight.body')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}