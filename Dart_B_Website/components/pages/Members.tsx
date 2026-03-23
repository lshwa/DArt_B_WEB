import React, { useState } from 'react';
import { PageBanner } from '../common/PageBanner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Mail, Github, Linkedin, Instagram } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import defaultProfileImage from 'figma:asset/ec414ae3866542c391520d229e3ac60f7a7aa77c.png';

export function Members() {
  const [selectedGeneration, setSelectedGeneration] = useState('5');
  const [activeFilter, setActiveFilter] = useState('all');

  const executives = [
    {
      id: 1,
      name: '김다트',
      position: '총괄팀장',
      major: '경영학과 (20)',
      image: defaultProfileImage,
      contacts: {
        email: 'president@dartb.com',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com'
      }
    },
    {
      id: 2,
      name: '이분석',
      position: '운영팀장',
      major: '경영학과 (21)',
      image: defaultProfileImage,
      contacts: {
        email: 'operation@dartb.com',
        github: 'https://github.com'
      }
    },
    {
      id: 3,
      name: '박데이터',
      position: '교육팀장',
      major: '경영학과 (21)',
      image: defaultProfileImage,
      contacts: {
        email: 'education@dartb.com',
        instagram: 'https://instagram.com'
      }
    },
    {
      id: 4,
      name: '최협력',
      position: '대외협력팀장',
      major: '응용통계학과 (22)',
      image: defaultProfileImage,
      contacts: {
        email: 'external@dartb.com',
        linkedin: 'https://linkedin.com'
      }
    },
    {
      id: 5,
      name: '정기획',
      position: '기획총무팀장',
      major: '경영학과 (22)',
      image: defaultProfileImage,
      contacts: {
        email: 'planning@dartb.com',
        github: 'https://github.com'
      }
    },
    {
      id: 6,
      name: '강홍보',
      position: '홍보팀장',
      major: '경영학과 (23)',
      image: defaultProfileImage,
      contacts: {
        email: 'marketing@dartb.com',
        instagram: 'https://instagram.com'
      }
    }
  ];

  const members = [
    {
      id: 7,
      name: '최학회',
      major: '경영학과 (22)',
      image: defaultProfileImage,
      contacts: {
        email: 'member1@dartb.com',
        github: 'https://github.com'
      }
    },
    {
      id: 8,
      name: '정회원',
      major: '응용통계학과 (22)',
      image: defaultProfileImage,
      contacts: {
        email: 'member2@dartb.com',
        linkedin: 'https://linkedin.com'
      }
    },
    {
      id: 9,
      name: '강신입',
      major: '경영학과 (23)',
      image: defaultProfileImage,
      contacts: {
        email: 'member3@dartb.com',
        github: 'https://github.com',
        instagram: 'https://instagram.com'
      }
    }
  ];

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
                <SelectItem value="5">5기</SelectItem>
                <SelectItem value="4">4기</SelectItem>
                <SelectItem value="3">3기</SelectItem>
                <SelectItem value="2">2기</SelectItem>
                <SelectItem value="1">1기</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeFilter === 'all' 
                  ? 'bg-[#0B2447] bg-opacity-20 text-[#0B2447] font-bold' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setActiveFilter('executives')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeFilter === 'executives' 
                  ? 'bg-[#0B2447] bg-opacity-20 text-[#0B2447] font-bold' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Executives
            </button>
            <button
              onClick={() => setActiveFilter('members')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeFilter === 'members' 
                  ? 'bg-[#0B2447] bg-opacity-20 text-[#0B2447] font-bold' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Members
            </button>
          </div>

          {/* Executives Section */}
          {(activeFilter === 'all' || activeFilter === 'executives') && (
            <div className="mb-16">
              <h3 className="text-xl font-bold text-[#0B2447] mb-6">Executives</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {executives.map((exec) => (
                  <div key={exec.id} className="group relative">
                    <div className="relative overflow-hidden rounded-[10px] shadow-lg">
                      <ImageWithFallback
                        src={exec.image}
                        alt={exec.name}
                        className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <h4 className="font-bold text-lg mb-1">{exec.name}</h4>
                          <p className="text-sm mb-1">{exec.major}</p>
                          <div className="flex justify-center space-x-1">
                            {exec.contacts.email && (
                              <ContactIcon type="email" email={exec.contacts.email} />
                            )}
                            {exec.contacts.github && (
                              <ContactIcon type="github" url={exec.contacts.github} />
                            )}
                            {exec.contacts.linkedin && (
                              <ContactIcon type="linkedin" url={exec.contacts.linkedin} />
                            )}
                            {exec.contacts.instagram && (
                              <ContactIcon type="instagram" url={exec.contacts.instagram} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      <p className="font-bold text-[#0B2447]">{exec.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Section */}
          {(activeFilter === 'all' || activeFilter === 'members') && (
            <div>
              <h3 className="text-xl font-bold text-[#0B2447] mb-6">Members</h3>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="bg-white rounded-[10px] shadow-lg p-6 flex items-center space-x-6">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-[#0B2447]">{member.name}</h4>
                      <p className="text-gray-600">{member.major}</p>
                      <div className="flex space-x-2 mt-2">
                        {member.contacts.email && (
                          <ContactIcon type="email" email={member.contacts.email} />
                        )}
                        {member.contacts.github && (
                          <ContactIcon type="github" url={member.contacts.github} />
                        )}
                        {member.contacts.linkedin && (
                          <ContactIcon type="linkedin" url={member.contacts.linkedin} />
                        )}
                        {member.contacts.instagram && (
                          <ContactIcon type="instagram" url={member.contacts.instagram} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}