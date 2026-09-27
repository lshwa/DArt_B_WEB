import React from 'react';
import { PageBanner } from '../common/PageBanner';
import { Card } from '../ui/card';
import { Quote, Star } from 'lucide-react';
import { useDynamicList, DynamicItem } from '../../src/useDynamicList';

interface Recommendation extends DynamicItem {
  author: string;
  position: string;
  content: string;
  rating?: number;
}

const DEFAULT_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    author: '강영훈',
    position: '다트비 Founder',
    content: 'DArt-B에서 학문적 지식을 실무와 연결해 데이터 분석 역량을 키울 수 있었던 시간은 정말 값진 경험이었습니다. 같은 관심사를 가진 동료들과 함께 성장하고 협력했던 경험은 지금도 큰 자산으로 남아 있습니다. 데이터 분석에 관심 있는 분이라면 DArt-B를 통해 저와 같은 값진 경험을 얻어가시길 바랍니다.',
    rating: 5,
  },
  {
    id: '2',
    author: '서효정',
    position: '다트비 Founder',
    content: 'DArt-B는 단순히 복잡한 코드를 작성하고 데이터를 추출하여 시각화하는 것에 그치지 않고, 데이터에 기반하여 문제를 스스로 정의하고 인사이트를 도출하여 비즈니스에 도움이 될 수 있는 액션까지 도달하는 능력을 기르는 것을 목적으로 Founder들과 함께 설립한 학회입니다. 이를 위해 스터디와 공모전을 통해 실전 분석 역량을 반복적으로 훈련할 수 있도록 하였고, 저 또한 과정에서 학회원들과 함께 고민하며 성장한 경험이 분석가로서의 중요한 밑거름이 될 수 있었습니다. DArt-B에서 같은 방향성과 목적을 가진 여러 학회원들과 함께한다는 것 자체가 데이터 분석을 시작하는 가장 좋은 시작점이 될 수 있을거라 생각합니다.',
    rating: 5,
  },
];

export function Recommendations() {
  const { items: recommendations, isLoading } = useDynamicList<Recommendation>(
    'recommendations.items',
    DEFAULT_RECOMMENDATIONS
  );

  const renderStars = (rating: number = 5) => {
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

