import React, { useState, useEffect } from 'react';
import { PageBanner } from '../common/PageBanner';
import { Card } from '../ui/card';
import { Quote, Star } from 'lucide-react';

interface Recommendation {
  id: number;
  author: string;
  position: string;
  generation: number;
  content: string;
  rating: number;
  image_url?: string;
}

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: API에서 추천사 데이터 가져오기
    // 임시 데이터
    const mockRecommendations: Recommendation[] = [
      {
        id: 1,
        author: '김다트',
        position: '5기 총괄팀장',
        generation: 5,
        content: 'DArt-B에서의 경험은 제 인생의 터닝포인트였습니다. 데이터 분석에 대한 체계적인 학습과 실전 프로젝트를 통해 많은 것을 배울 수 있었고, 함께 성장하는 동료들을 만날 수 있어서 정말 행복했습니다.',
        rating: 5,
      },
      {
        id: 2,
        author: '이분석',
        position: '4기 운영팀장',
        generation: 4,
        content: 'DArt-B는 단순히 기술을 배우는 곳이 아니라, 비즈니스 인사이트를 도출하는 방법을 체득하는 곳입니다. 정규 세션과 스터디를 통해 실무에 바로 적용할 수 있는 역량을 기를 수 있었습니다.',
        rating: 5,
      },
      {
        id: 3,
        author: '박데이터',
        position: '5기 교육팀장',
        generation: 5,
        content: '데이터 분석에 대한 관심만 가지고 있었는데, DArt-B에서 체계적인 커리큘럼과 멘토링을 받으며 전문성을 키울 수 있었습니다. 특히 다양한 프로젝트와 대회 참여를 통해 실전 경험을 쌓을 수 있어서 매우 유익했습니다.',
        rating: 5,
      },
      {
        id: 4,
        author: '최협력',
        position: '4기 대외협력팀장',
        generation: 4,
        content: 'DArt-B의 가장 큰 장점은 함께 성장하는 문화입니다. 선배들의 조언과 동기들과의 협업을 통해 단순히 혼자 공부하는 것보다 훨씬 빠르게 성장할 수 있었습니다.',
        rating: 5,
      },
    ];

    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    }, 500);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-300 text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen">
      <PageBanner title="RECOMMENDATIONS" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Introduction */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0B2447] mb-4">추천사</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              DArt-B에서 활동했던 선배들의 생생한 후기를 확인해보세요.
              함께 성장하고 도전하는 DArt-B의 이야기를 들어보실 수 있습니다.
            </p>
          </div>

          {/* Recommendations Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B2447]"></div>
              <p className="mt-4 text-gray-600">추천사를 불러오는 중...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              아직 등록된 추천사가 없습니다.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#0B2447] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {rec.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#0B2447]">{rec.author}</h3>
                      <p className="text-sm text-gray-600">{rec.position}</p>
                      <p className="text-xs text-gray-500">{rec.generation}기</p>
                    </div>
                    <Quote className="w-8 h-8 text-[#0B2447] opacity-20 flex-shrink-0" />
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex gap-1">{renderStars(rec.rating)}</div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{rec.content}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gray-50 rounded-[10px] p-8">
              <h3 className="text-2xl font-bold text-[#0B2447] mb-4">
                DArt-B와 함께 성장하세요
              </h3>
              <p className="text-gray-700 mb-6">
                데이터 분석에 관심이 있으신가요? DArt-B에서 여러분의 꿈을 실현해보세요.
              </p>
              <a
                href="#recruiting"
                className="inline-block bg-[#0B2447] text-white px-8 py-3 rounded-lg hover:bg-[#0a1f3a] transition-colors"
              >
                모집 정보 보기
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

