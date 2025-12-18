import React from 'react';
import type { CardModel, PlaceCluster } from '@/types';
import {
  TitleCard,
  TrustCard,
  TopPlace1Card,
  TopPlaces23Card,
  PeakDayCard,
  PeakMonthCard,
  MostExploredMonthCard,
  TimeOfDayCard,
  DistinctPlacesCard,
  CollageCard,
} from './CardComponents';

interface CardRendererProps {
  card: CardModel;
  places?: PlaceCluster[];
  onPlacePress?: (place: PlaceCluster) => void;
  onPhotoPress?: (photos: string[], initialIndex: number) => void;
}

export function CardRenderer({ card, places, onPlacePress, onPhotoPress }: CardRendererProps) {
  switch (card.type) {
    case 'title':
      return <TitleCard card={card} />;
    case 'trust':
      return <TrustCard card={card} onPhotoPress={onPhotoPress} />;
    case 'topPlace1':
      return <TopPlace1Card card={card} onPlacePress={onPlacePress} onPhotoPress={onPhotoPress} />;
    case 'topPlaces23':
      return <TopPlaces23Card card={card} onPhotoPress={onPhotoPress} />;
    case 'peakDay':
      return <PeakDayCard card={card} onPhotoPress={onPhotoPress} />;
    case 'peakMonth':
      return <PeakMonthCard card={card} onPhotoPress={onPhotoPress} />;
    case 'mostExploredMonth':
      return <MostExploredMonthCard card={card} onPhotoPress={onPhotoPress} />;
    case 'timeOfDay':
      return <TimeOfDayCard card={card} onPhotoPress={onPhotoPress} />;
    case 'distinctPlaces':
      return <DistinctPlacesCard card={card} onPhotoPress={onPhotoPress} />;
    case 'collage':
      return <CollageCard card={card} onPhotoPress={onPhotoPress} />;
    default:
      return null;
  }
}

