import React from 'react';
import { PageBanner } from '../common/PageBanner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Calendar, Trophy, Users } from 'lucide-react';

export function DataThon() {
  const datathons = [
    {
      id: 1,
      title: '앵날다쏘 (중앙대 DArt-B x 서강대 Parrot)',
      date: '2024.11',
      description: '중앙대학교 DArt-B와 서강대학교 Parrot이 함께하는 연합 해커톤으로, 실제 기업 데이터를 활용한 과제를 해결합니다.',
      image: 'https://images.unsplash.com/photo-1758691736804-4e88c52ad58b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9qZWN0JTIwdGVhbSUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzU5NTcyOTcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      latest: true
    },
    {
      id: 2,
      title: '아러다 (중앙대 DArt-B x 중앙대 CUAI)',
      date: '2024.08',
      description: '중앙대학교 데이터 분석 학회 DArt-B와 인공지능 학회 CUAI가 진행하는 해커톤으로, 데이터 분석과 AI 기술의 융합을 경험합니다.',
      image: 'https://images.unsplash.com/photo-1758691736764-2a88e313b1f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHlzaXMlMjBzZXNzaW9ufGVufDF8fHx8MTc1OTU3Mjk2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      latest: false
    },
    {
      id: 3,
      title: '쿠쿠다트 (중앙대 DArt-B x 경희대 KHUDA)',
      date: '2024.05',
      description: '중앙대학교와 경희대학교의 데이터톤으로, 두 대학의 데이터 분석 학회가 함께하여 다양한 분야의 데이터 분석 경험을 제공합니다.',
      image: 'https://images.unsplash.com/photo-1587116987928-21e47bd76cd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNydWl0bWVudCUyMHByb2Nlc3MlMjBpbmZvZ3JhcGhpY3xlbnwxfHx8fDE3NTk1NzMxNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      latest: false
    }
  ];

  return (
    <div className="min-h-screen">
      <PageBanner title="DATA-THON" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* History Timeline */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#0B2447] text-center mb-12">연합 해커톤/데이터톤 연혁</h2>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#0B2447]"></div>
              
              <div className="space-y-8">
                {datathons.map((event, index) => (
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
          </div>

          {/* Detailed Sections */}
          <div className="space-y-16">
            {datathons.map((datathon, index) => (
              <div key={datathon.id}>
                <h2 className="text-2xl font-bold text-[#0B2447] text-center mb-8">{datathon.title}</h2>
                
                <div className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                    <ImageWithFallback
                      src={datathon.image}
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
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">참가 팀: 15개 팀</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Trophy className="w-4 h-4" />
                          <span className="text-sm">DArt-B 팀 성과: 우수상 수상</span>
                        </div>
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
        </div>
      </main>
    </div>
  );
}