export interface WeatherDailyForecast {
  date: string;
  weatherCode: number;
  conditionText: string;
  icon: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  uvIndexMax: number;
}

export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number;
  apparentTemperature: number;
  windSpeed: number;
  humidity: number;
  weatherCode: number;
  conditionText: string;
  conditionIcon: string;
  isDay: boolean;
  tempMax: number;
  tempMin: number;
  uvIndex: number;
  cloudCover: number;
  precipitation: number;
  dailyForecast: WeatherDailyForecast[];
}

export interface PackingItem {
  id: string;
  text: string;
  category: 'roupas' | 'calcados' | 'acessorios' | 'essenciais';
  checked: boolean;
  reason?: string;
}

export interface Activity {
  id: string;
  title: string;
  timeOfDay: 'Manhã' | 'Tarde' | 'Noite';
  location: string;
  category: 'indoor' | 'outdoor' | 'cultural' | 'gastronomia' | 'lazer';
  description: string;
  weatherNote: string;
}

export interface TripPlan {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  weather: WeatherData;
  summary: {
    temperatureText: string;
    windText: string;
    conditionText: string;
    overallAdvice: string;
  };
  packingTips: PackingItem[];
  suggestedItinerary: Activity[];
  generatedAt: string;
}

export interface FunctionCallLog {
  functionName: string;
  args: Record<string, any>;
  result: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  tripPlan?: TripPlan;
  functionCalls?: FunctionCallLog[];
  timestamp: string;
  isError?: boolean;
}
