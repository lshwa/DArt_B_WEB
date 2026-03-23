import React from 'react';
import { DynamicImage } from './common/DynamicImage';

export function CurriculumSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#0B2447] mb-4">CURRICULUM</h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            저희 다트비에서는 이론과 실습을 균형 있게 경험하며, 데이터 분석가로서의 기반을 다질 수 있습니다.
          </p>
        </div>

        {/* Session Activities */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center text-[#0B2447] mb-12">정규 세션 활동</h3>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <DynamicImage
                imageKey="home.curriculum.session"
                alt="정규 세션 활동"
                className="w-full h-80 object-cover rounded-[10px] shadow-lg"
                style={{ filter: 'drop-shadow(0px 0px 25px rgba(0,0,0,0.1))' }}
              />
            </div>
            <div className="order-1 md:order-2">
              <h4 className="text-xl font-bold text-[#0B2447] mb-4">정규 세션</h4>
              <p className="text-gray-700 mb-6 leading-relaxed">
                매주 진행되는 정규 세션을 통해 데이터 분석의 기초부터 심화까지 체계적으로 학습합니다. 
                이론 강의와 실습을 병행하여 실무에 필요한 역량을 기를 수 있습니다.
              </p>
              
              <h4 className="text-xl font-bold text-[#0B2447] mb-4">정규 스터디</h4>
              <p className="text-gray-700 leading-relaxed">
                소그룹 스터디를 통해 심화 학습과 프로젝트 경험을 쌓을 수 있습니다. 
                동기들과 함께 성장하며 네트워킹도 형성할 수 있는 좋은 기회입니다.
              </p>
            </div>
          </div>
        </div>

        {/* Project Activities */}
        <div>
          <h3 className="text-2xl font-bold text-center text-[#0B2447] mb-12">프로젝트 활동</h3>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-xl font-bold text-[#0B2447] mb-4">학술제</h4>
              <p className="text-gray-700 mb-6 leading-relaxed">
                매 학기 말 진행되는 학술제에서 한 학기 동안의 학습 성과를 발표합니다. 
                실제 데이터를 활용한 프로젝트를 통해 실무 경험을 쌓을 수 있습니다.
              </p>
              
              <h4 className="text-xl font-bold text-[#0B2447] mb-4">연합 데이터톤</h4>
              <p className="text-gray-700 leading-relaxed">
                타 대학 데이터 분석 동아리와 함께하는 연합 데이터톤에 참여하여 
                더 넓은 네트워크를 형성하고 실력을 검증받을 수 있는 기회를 제공합니다.
              </p>
            </div>
            <div>
              <DynamicImage
                imageKey="home.curriculum.project"
                alt="프로젝트 활동"
                className="w-full h-80 object-cover rounded-[10px] shadow-lg"
                style={{ filter: 'drop-shadow(0px 0px 25px rgba(0,0,0,0.1))' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}