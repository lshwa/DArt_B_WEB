import React, { useState, useEffect } from 'react';
import { PageBanner } from '../common/PageBanner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Mail, Github, Linkedin, Instagram } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { memberApi, Member, getImageUrl } from '../../src/api';

export function Members() {
  const [selectedGeneration, setSelectedGeneration] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await memberApi.getAll({ is_active: true });
      if (response.data) {
        setMembers(response.data);
        // 멤버가 있으면 첫 번째 기수로 설정
        if (response.data.length > 0 && !selectedGeneration) {
          const generations = Array.from(new Set(response.data.map(m => m.generation)))
            .sort((a, b) => b - a);
          if (generations.length > 0) {
            setSelectedGeneration(generations[0].toString());
          }
        }
      } else {
        setError(response.error || '멤버 정보를 불러오는데 실패했습니다.');
        console.error('Failed to load members:', response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '멤버 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('Failed to load members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용 가능한 기수 목록 생성
  const availableGenerations = Array.from(new Set(members.map(m => m.generation)))
    .sort((a, b) => b - a);
  

  // 선택된 기수에 해당하는 멤버 필터링 및 정렬
  const isAllGenerations = selectedGeneration === 'all';
  const currentGeneration = isAllGenerations ? null : (selectedGeneration ? parseInt(selectedGeneration) : null);
  
  // Executives 정렬 헬퍼 함수
  const sortExecutives = (a: Member, b: Member) => {
    // 1. 기수 순 (오름차순 - 1기부터)
    if (a.generation !== b.generation) {
      return a.generation - b.generation;
    }
    
    // 2. 같은 기수 내에서 직책 우선순위
    const aPosition = a.position || '';
    const bPosition = b.position || '';
    
    // FND 팀장이 우선순위가 높음
    const aIsFND = aPosition.toUpperCase().includes('FND');
    const bIsFND = bPosition.toUpperCase().includes('FND');
    
    if (aIsFND && !bIsFND) return -1; // a가 FND면 앞으로
    if (!aIsFND && bIsFND) return 1;  // b가 FND면 b가 앞으로
    
    // 둘 다 FND이거나 둘 다 아닌 경우, 이름순
    return a.name.localeCompare(b.name, 'ko');
  };

  // Executives 필터링 및 정렬
  const executives = isAllGenerations
    ? members.filter(m => m.is_executive).sort(sortExecutives)
    : currentGeneration 
      ? members.filter(m => m.is_executive && m.generation === currentGeneration).sort((a, b) => {
          // 같은 기수 내에서도 FND 우선순위 적용
          const aPosition = a.position || '';
          const bPosition = b.position || '';
          const aIsFND = aPosition.toUpperCase().includes('FND');
          const bIsFND = bPosition.toUpperCase().includes('FND');
          
          if (aIsFND && !bIsFND) return -1;
          if (!aIsFND && bIsFND) return 1;
          return a.name.localeCompare(b.name, 'ko');
        })
      : [];
      
  // Regular Members 필터링 및 정렬 (기수 오름차순 - 1기부터, 같은 기수면 이름순)
  const regularMembers = isAllGenerations
    ? members.filter(m => !m.is_executive).sort((a, b) => {
        if (a.generation !== b.generation) {
          return a.generation - b.generation; // 기수 오름차순 (1기부터)
        }
        return a.name.localeCompare(b.name, 'ko'); // 같은 기수면 이름순
      })
    : currentGeneration
      ? members.filter(m => !m.is_executive && m.generation === currentGeneration).sort((a, b) => 
          a.name.localeCompare(b.name, 'ko')
        )
      : [];
  
  // 선택된 기수가 없으면 "전체"로 설정
  useEffect(() => {
    if (availableGenerations.length > 0 && !selectedGeneration) {
      setSelectedGeneration('all');
    } else if (selectedGeneration && selectedGeneration !== 'all' && !availableGenerations.includes(parseInt(selectedGeneration))) {
      setSelectedGeneration('all');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const ContactIcon = ({ type, url, email }: { type: string; url?: string; email?: string }) => {
    const handleClick = () => {
      if (type === 'email' && email) {
        copyToClipboard(email);
      } else if (url) {
        window.open(url, '_blank');
      }
    };

    const iconMap = {
      email: <Mail className="w-4 h-4" />,
      github: <Github className="w-4 h-4" />,
      linkedin: <Linkedin className="w-4 h-4" />,
      instagram: <Instagram className="w-4 h-4" />
    };

    return (
      <button
        onClick={handleClick}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title={type === 'email' ? '이메일 복사' : `${type} 프로필 보기`}
      >
        {iconMap[type as keyof typeof iconMap]}
      </button>
    );
  };

  return (
    <div className="min-h-screen">
      <PageBanner title="MEMBERS" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Generation Selector */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#0B2447]">DArt-B MEMBERS</h2>
            <Select value={selectedGeneration} onValueChange={setSelectedGeneration}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {availableGenerations.length > 0 ? (
                  availableGenerations.map((gen) => (
                    <SelectItem key={gen} value={gen.toString()}>
                      {gen}기
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="5">5기</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeFilter === 'all' 
                  ? 'bg-[#0B2447] text-white font-bold' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setActiveFilter('executives')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeFilter === 'executives' 
                  ? 'bg-[#0B2447] text-white font-bold' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Executives
            </button>
            <button
              onClick={() => setActiveFilter('members')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeFilter === 'members' 
                  ? 'bg-[#0B2447] text-white font-bold' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Members
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">로딩 중...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">등록된 멤버가 없습니다.</p>
            </div>
          ) : availableGenerations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">표시할 멤버가 없습니다.</p>
            </div>
          ) : (
            <>
              {/* Executives Section - 일반 멤버와 동일한 형식 */}
              {(activeFilter === 'all' || activeFilter === 'executives') && executives.length > 0 && (
                <div className={activeFilter === 'all' ? 'mb-16' : ''}>
                  <h3 className="text-xl font-bold text-[#0B2447] mb-6">Executives</h3>
                  <div className="space-y-4">
                    {executives.map((exec) => {
                      // 이미지 URL 생성 - 확실하게 처리
                      let imageUrl: string | null = null;
                      if (exec.profile_image_url && exec.profile_image_url.trim() !== '') {
                        imageUrl = getImageUrl(exec.profile_image_url);
                        console.log(`Image URL for ${exec.name}:`, {
                          original: exec.profile_image_url,
                          processed: imageUrl
                        });
                      }
                      
                      return (
                        <div key={exec.id} className="bg-white rounded-[10px] shadow-lg p-6 flex items-center space-x-6">
                          <div className="flex-shrink-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={exec.name}
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                style={{ display: 'block' }}
                                onError={(e) => {
                                  console.error(`Failed to load image for ${exec.name}:`, imageUrl);
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const fallback = document.createElement('div');
                                  fallback.className = 'w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-200 flex items-center justify-center';
                                  fallback.innerHTML = '<span class="text-gray-400 text-xs">No Image</span>';
                                  target.parentElement?.appendChild(fallback);
                                }}
                                onLoad={() => {
                                  console.log(`Successfully loaded image for ${exec.name}:`, imageUrl);
                                }}
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-[#0B2447]">{exec.name}</h4>
                            <p className="text-gray-600">{exec.major || ''}</p>
                            <p className="text-sm text-gray-500 mt-1">{exec.generation}기</p>
                            {exec.position && (
                              <p className="text-sm text-[#0B2447] font-semibold mt-1">{exec.position}</p>
                            )}
                            <div className="flex space-x-2 mt-2">
                              {exec.email && (
                                <ContactIcon type="email" email={exec.email} />
                              )}
                              {exec.github && (
                                <ContactIcon type="github" url={exec.github} />
                              )}
                              {exec.linkedin && (
                                <ContactIcon type="linkedin" url={exec.linkedin} />
                              )}
                              {exec.instagram && (
                                <ContactIcon type="instagram" url={exec.instagram} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Members Message */}
              {executives.length === 0 && regularMembers.length === 0 && selectedGeneration && selectedGeneration !== 'all' && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {selectedGeneration}기에 해당하는 멤버가 없습니다.
                  </p>
                </div>
              )}

              {/* Members Section */}
              {(activeFilter === 'all' || activeFilter === 'members') && regularMembers.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-[#0B2447] mb-6">Members</h3>
                  <div className="space-y-4">
                    {regularMembers.map((member) => {
                      // 이미지 URL 생성 - 확실하게 처리
                      let imageUrl: string | null = null;
                      if (member.profile_image_url && member.profile_image_url.trim() !== '') {
                        imageUrl = getImageUrl(member.profile_image_url);
                        console.log(`Image URL for ${member.name}:`, {
                          original: member.profile_image_url,
                          processed: imageUrl
                        });
                      }
                      
                      return (
                        <div key={member.id} className="bg-white rounded-[10px] shadow-lg p-6 flex items-center space-x-6">
                          <div className="flex-shrink-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={member.name}
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                style={{ display: 'block' }}
                                onError={(e) => {
                                  console.error(`Failed to load image for ${member.name}:`, imageUrl);
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const fallback = document.createElement('div');
                                  fallback.className = 'w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-200 flex items-center justify-center';
                                  fallback.innerHTML = '<span class="text-gray-400 text-xs">No Image</span>';
                                  target.parentElement?.appendChild(fallback);
                                }}
                                onLoad={() => {
                                  console.log(`Successfully loaded image for ${member.name}:`, imageUrl);
                                }}
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-[#0B2447]">{member.name}</h4>
                            <p className="text-gray-600">{member.major || ''}</p>
                            <p className="text-sm text-gray-500 mt-1">{member.generation}기</p>
                            <div className="flex space-x-2 mt-2">
                              {member.email && (
                                <ContactIcon type="email" email={member.email} />
                              )}
                              {member.github && (
                                <ContactIcon type="github" url={member.github} />
                              )}
                              {member.linkedin && (
                                <ContactIcon type="linkedin" url={member.linkedin} />
                              )}
                              {member.instagram && (
                                <ContactIcon type="instagram" url={member.instagram} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}