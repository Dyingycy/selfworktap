import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherData, CITY_PRESETS, DEFAULT_CITY } from '@/lib/services/weatherService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityName = searchParams.get('city') || DEFAULT_CITY.name;
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const districtParam = searchParams.get('district');

    // Find preset if matched
    const matchedPreset = CITY_PRESETS.find(p => p.name === cityName || p.city === cityName);

    const lat = latParam ? parseFloat(latParam) : (matchedPreset?.lat ?? DEFAULT_CITY.lat);
    const lon = lonParam ? parseFloat(lonParam) : (matchedPreset?.lon ?? DEFAULT_CITY.lon);
    const district = districtParam || matchedPreset?.district || DEFAULT_CITY.district;

    const weather = await fetchWeatherData(lat, lon, cityName, district);

    return NextResponse.json({
      success: true,
      data: weather,
      presets: CITY_PRESETS,
    });
  } catch (error: any) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
