// components/IntelligenceScores.tsx
'use client';

interface IntelligenceScoresProps {
  scores: {
    overall_score: number;
    data_completeness_score: number;
    service_diversity_score: number;
    digital_presence_score: number;
    patient_experience_score: number;
    calculated_at: string;
  };
}

export default function IntelligenceScores({ scores }: IntelligenceScoresProps) {
  if (!scores) return null;

  const scoreItems = [
    {
      label: 'Data Completeness',
      score: scores.data_completeness_score,
      color: 'blue',
      icon: '📊',
      description: 'Completeness of clinic information'
    },
    {
      label: 'Service Diversity',
      score: scores.service_diversity_score,
      color: 'purple',
      icon: '🏥',
      description: 'Range of services offered'
    },
    {
      label: 'Digital Presence',
      score: scores.digital_presence_score,
      color: 'green',
      icon: '💻',
      description: 'Online booking, telehealth, patient portal'
    },
    {
      label: 'Patient Experience',
      score: scores.patient_experience_score,
      color: 'amber',
      icon: '⭐',
      description: 'Ratings, reviews, and accessibility'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">🎯</span>
            Quality Intelligence Score
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered analysis of clinic quality and service offerings
          </p>
        </div>
        
        {/* Overall Score Badge */}
        <div className="text-center">
          <div className={`text-5xl font-bold ${getScoreColor(scores.overall_score)}`}>
            {scores.overall_score}
          </div>
          <div className="text-sm text-gray-600 font-medium">Overall</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scoreItems.map((item, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.label}</h3>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                {item.score}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${getBarColor(item.score)}`}
                style={{ width: `${item.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {new Date(scores.calculated_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );
}
