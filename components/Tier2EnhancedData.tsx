// components/Tier2EnhancedData.tsx
'use client';

import { 
  CompetitionMetrics, 
  ReviewIntelligence, 
  RealTimeStatus,
  ConvenienceScores,
  SocialProofExtended 
} from '@/lib/dataTypes';

// ============================================================================
// Competition Badge Component
// ============================================================================

export function CompetitionBadge({ metrics }: { metrics?: CompetitionMetrics }) {
  if (!metrics) return null;

  const getColor = () => {
    if (metrics.rating_percentile >= 75) return 'bg-green-100 text-green-800 border-green-300';
    if (metrics.rating_percentile >= 50) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border-2 ${getColor()}`}>
      <span className="mr-2">🏆</span>
      <span>{metrics.market_position} in {metrics.competition_density} Competition</span>
    </div>
  );
}

// ============================================================================
// Review Intelligence Section
// ============================================================================

export function ReviewInsightsSection({ intelligence }: { intelligence?: ReviewIntelligence }) {
  if (!intelligence || intelligence.total_analyzed === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <span className="text-2xl mr-2">🧠</span>
        Patient Insights from {intelligence.total_analyzed} Reviews
      </h2>

      {/* Overall Sentiment */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl">
            {intelligence.sentiment_score >= 0.7 ? '😊' : 
             intelligence.sentiment_score >= 0.5 ? '🙂' : '😐'}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {intelligence.overall_sentiment}
            </div>
            <div className="text-sm text-gray-600">
              Overall Patient Sentiment
            </div>
          </div>
        </div>
      </div>

      {/* Common Praise */}
      {intelligence.common_praise.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
            What Patients Love
          </h3>
          <div className="space-y-2">
            {intelligence.common_praise.slice(0, 5).map((praise, idx) => (
              <div key={idx} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                <span className="text-sm text-gray-800 capitalize">{praise.topic}</span>
                <span className="text-xs font-medium text-green-700">
                  Mentioned {praise.mentions}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Complaints */}
      {intelligence.common_complaints.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
            Areas for Improvement
          </h3>
          <div className="space-y-2">
            {intelligence.common_complaints.slice(0, 3).map((complaint, idx) => (
              <div key={idx} className="flex items-center justify-between bg-amber-50 px-3 py-2 rounded">
                <span className="text-sm text-gray-800 capitalize">{complaint.topic}</span>
                <span className="text-xs font-medium text-amber-700">
                  Mentioned {complaint.mentions}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Insights */}
      {intelligence.extracted_insights.typical_wait_time && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="text-sm text-blue-800">
            <strong>Typical Wait Time:</strong> {intelligence.extracted_insights.typical_wait_time}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Real-Time Status Banner
// ============================================================================

export function RealTimeStatusBanner({ status }: { status?: RealTimeStatus }) {
  if (!status) return null;

  const getTrendIcon = () => {
    if (status.trending.rating_trend_30d === 'up') return '📈';
    if (status.trending.rating_trend_30d === 'down') return '📉';
    return '➡️';
  };

  const getTrendText = () => {
    if (status.trending.rating_trend_30d === 'up') return 'Trending Up';
    if (status.trending.rating_trend_30d === 'down') return 'Declining';
    return 'Stable';
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {status.currently_open ? '🟢' : '🔴'}
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {status.currently_open ? 'Currently Open' : 'Currently Closed'}
            </div>
            {status.current_busy_level && (
              <div className="text-sm text-gray-600">
                Busy Level: {status.current_busy_level}
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-800">
            <span>{getTrendIcon()}</span>
            <span>{getTrendText()}</span>
          </div>
          <div className="text-xs text-gray-600">
            {status.trending.new_reviews_30d} new reviews this month
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Convenience Score Card
// ============================================================================

export function ConvenienceScoreCard({ scores }: { scores?: ConvenienceScores }) {
  if (!scores) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <span className="text-2xl mr-2">🚶</span>
        Location Convenience
      </h2>

      {/* Walk/Transit Scores */}
      {(scores.walk_score || scores.transit_score) && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {scores.walk_score && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {scores.walk_score}
              </div>
              <div className="text-sm text-gray-600">Walk Score</div>
            </div>
          )}
          {scores.transit_score && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {scores.transit_score}
              </div>
              <div className="text-sm text-gray-600">Transit Score</div>
            </div>
          )}
        </div>
      )}

      {/* Parking */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Parking</span>
          <span className="text-sm text-gray-900">
            {scores.parking_assessment.difficulty} • {scores.parking_assessment.estimated_cost}
          </span>
        </div>
      </div>

      {/* Nearby Amenities */}
      {scores.nearby_amenities.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Nearby</h3>
          <div className="space-y-2">
            {scores.nearby_amenities.map((amenity, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{amenity.name}</span>
                <span className="text-gray-500">{amenity.distance_miles.toFixed(1)} mi</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Social Proof Summary
// ============================================================================

export function SocialProofSummary({ social }: { social?: SocialProofExtended }) {
  if (!social) return null;

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-md p-6 border-2 border-yellow-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <span className="text-2xl mr-2">⭐</span>
        Verified Reputation
      </h2>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-yellow-600">
            {social.aggregate_rating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Overall Rating</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">
            {social.total_reviews_all_platforms}
          </div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="space-y-3">
        {social.platforms.google && (
          <div className="flex items-center justify-between bg-white px-4 py-2 rounded">
            <span className="font-medium text-gray-700">Google</span>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">★</span>
              <span className="font-semibold">{social.platforms.google.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({social.platforms.google.count})</span>
            </div>
          </div>
        )}
        {social.platforms.yelp && (
          <div className="flex items-center justify-between bg-white px-4 py-2 rounded">
            <span className="font-medium text-gray-700">Yelp</span>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">★</span>
              <span className="font-semibold">{social.platforms.yelp.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({social.platforms.yelp.count})</span>
            </div>
          </div>
        )}
      </div>

      {/* Trust Signals */}
      {social.trust_signals.years_in_business && (
        <div className="mt-4 pt-4 border-t border-yellow-200">
          <p className="text-sm text-gray-700 text-center">
            ✓ {social.trust_signals.years_in_business} years in business
          </p>
        </div>
      )}
    </div>
  );
}
