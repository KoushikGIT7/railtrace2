import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    isGood: boolean;
  };
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant: 'default' | 'success' | 'warning' | 'error';
  };
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon,
  badge 
}: StatsCardProps) {
  return (
    <Card hover className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {badge && (
                <Badge variant={badge.variant} size="sm">
                  {badge.text}
                </Badge>
              )}
            </div>
            
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {trend && (
                <div className={`flex items-center text-xs font-medium ${
                  trend.isGood 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {trend.direction === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
            
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          
          {icon && (
            <div className="text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Subtle background pattern */}
      <div className="absolute top-0 right-0 -m-2 w-16 h-16 bg-gradient-to-br from-blue-50 to-transparent rounded-full opacity-50" />
    </Card>
  );
}