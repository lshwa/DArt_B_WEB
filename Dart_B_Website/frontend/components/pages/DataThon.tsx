import React from 'react';
import { PageBanner } from '../common/PageBanner';
import { DynamicImage } from '../common/DynamicImage';
import { Calendar, Trophy, Users, RefreshCw } from 'lucide-react';
import { useDatathons } from '../../src/useDatathons';

export function DataThon() {
  const { entries: datathons, isLoading } = useDatathons();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PageBanner title="DATA-THON" />
        <div className="flex items-center justify-center pt-32">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0B2447]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageBanner title="DATA-THON" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* History Timeline */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#0B2447] text-center mb-12">연합 해커톤/데이터톤 연혁</h2>
            
            {datathons.length === 0 ? (
              <p className="text-center text-gray-400 py-12">아직 등록된 데이터톤 항목이 없습니다.</p>
            ) : (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#0B2447]"></div>
                
                <div className="space-y-8">
                  {datathons.map((event) => (
                    <div key={event.id} className="relative flex items-start space-x-6">
                      {/* Timeline Dot */}
                      <div className={`relative z-10 w-16 h-16 ${event.latest ? 'bg-[#0B2447]' : 'bg-gray-400'} rounded-full flex items-center justify-center`}>
                        {event.latest ? (
                          <Trophy className="w-8 h-8 text-white" />
                        ) : (
                          <Calendar className="w-8 h-8 text-white" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-[10px] shadow-lg p-6">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-bold text-[#0B2447]">{event.title}</h3>
                            {event.latest && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">최신</span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm mb-3">{event.date}</p>
                          <p className="text-gray-700">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Sections */}
          {datathons.length > 0 && (
            <div className="space-y-16">
              {datathons.map((datathon, index) => (
                <div key={datathon.id}>
                  <h2 className="text-2xl font-bold text-[#0B2447] text-center mb-8">{datathon.title}</h2>
                  
                  <div className={`grid md:grid-cols-2 gap-12 items-center`}>
                    <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                      <DynamicImage
                        imageKey={datathon.imageKey}
                        alt={datathon.title}
                        className="w-full h-80 object-cover rounded-[10px] shadow-lg"
                        style={{ filter: 'drop-shadow(0px 0px 25px rgba(0,0,0,0.1))' }}
                      />
                    </div>
                    
                    <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-[#0B2447]">
                          <Calendar className="w-5 h-5" />
                          <span className="font-bold">{datathon.date}</span>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed">
                          {datathon.description}
                        </p>
                        
                        <div className="space-y-2">
                          {datathon.participants && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">참가 팀: {datathon.participants}</span>
                            </div>
                          )}
                          {datathon.achievement && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Trophy className="w-4 h-4" />
                              <span className="text-sm">{datathon.achievement}</span>
                            </div>
                          )}
                        </div>
                        
                        {datathon.latest && (
                          <div className="bg-blue-50 border-l-4 border-[#0B2447] p-4 mt-6">
                            <p className="text-[#0B2447] font-bold text-sm">
                              💡 가장 최근 참여한 데이터톤으로, 우수한 성과를 거두었습니다!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}