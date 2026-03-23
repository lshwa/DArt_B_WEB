import React from 'react';
import { PageBanner } from '../common/PageBanner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Wine, Users, Calendar } from 'lucide-react';

export function Networking() {
  return (
    <div className="min-h-screen">
      <PageBanner title="NETWORKING" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Title Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0B2447] mb-6">DArt-B의 밤</h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              학회원들 간의 친목을 도모하고 네트워킹을 강화하는 DArt-B만의 특별한 이벤트입니다. 
              학술적 교류를 넘어 진정한 공동체 문화를 만들어갑니다.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-16">
            {/* First Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1702737832079-ed5864397f92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwa29yZWF8ZW58MXx8fHwxNTk1NzI5NjV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="DArt-B의 밤 이벤트"
                  className="w-full h-80 object-cover rounded-[10px] shadow-lg"
                  style={{ filter: 'drop-shadow(0px 0px 25px rgba(0,0,0,0.1))' }}
                />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Wine className="w-8 h-8 text-[#0B2447]" />
                  <h3 className="text-2xl font-bold text-[#0B2447]">따뜻한 만남의 시간</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  DArt-B의 밤은 학기마다 개최되는 네트워킹 이벤트로, 학회원들이 학업과 프로젝트를 넘어 
                  개인적인 관계를 형성할 수 있는 소중한 시간입니다. 편안한 분위기에서 선배와 후배, 
                  동기들과 깊이 있는 대화를 나누며 진정한 공동체를 만들어갑니다.
                </p>
              </div>
            </div>

            {/* Second Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-8 h-8 text-[#0B2447]" />
                  <h3 className="text-2xl font-bold text-[#0B2447]">다양한 활동과 교류</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  다양한 게임과 활동을 통해 서로를 더 잘 알아가는 시간을 가집니다. 
                  팀 빌딩 활동, 퀴즈 대회, 토크 세션 등을 통해 자연스럽게 소통하며, 
                  학회 생활에서 얻기 힘든 특별한 추억을 만들어갑니다.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758691736764-2a88e313b1f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHlzaXMlMjBzZXNzaW9ufGVufDF8fHx8MTc1OTU3Mjk2N3ww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="네트워킹 활동"
                  className="w-full h-80 object-cover rounded-[10px] shadow-lg"
                  style={{ filter: 'drop-shadow(0px 0px 25px rgba(0,0,0,0.1))' }}
                />
              </div>
            </div>

            {/* Third Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758691736804-4e88c52ad58b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9qZWN0JTIwdGVhbSUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzU5NTcyOTcxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="단체 사진"
                  className="w-full h-80 object-cover rounded-[10px] shadow-lg"
                  style={{ filter: 'drop-shadow(0px 0px 25px rgba(0,0,0,0.1))' }}
                />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-8 h-8 text-[#0B2447]" />
                  <h3 className="text-2xl font-bold text-[#0B2447]">지속적인 유대 관계</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  DArt-B의 밤을 통해 형성된 인맥과 관계는 학회 활동을 넘어 평생의 자산이 됩니다. 
                  데이터 분석이라는 공통 관심사를 가진 동료들과의 깊은 유대는 향후 커리어에도 
                  큰 도움이 되며, 서로의 성장을 응원하는 든든한 네트워크가 됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* Highlight Box */}
          <div className="mt-16 bg-gradient-to-r from-[#0B2447] to-[#1a3a5c] rounded-[10px] p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">6기부터 시작된 새로운 전통</h3>
            <p className="text-lg opacity-90 leading-relaxed">
              DArt-B의 밤은 6기 운영진이 기획하고 시작한 특별한 이벤트입니다. 
              학회의 새로운 전통으로 자리잡으며, 앞으로도 계속해서 발전시켜 나갈 예정입니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}