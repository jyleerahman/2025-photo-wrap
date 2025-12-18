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
}

export function CardRenderer({ card, places, onPlacePress }: CardRendererProps) {
  switch (card.type) {
    case 'title':
      return <TitleCard card={card} />;
    case 'trust':
      return <TrustCard card={card} />;
    case 'topPlace1':
      return <TopPlace1Card card={card} onPlacePress={onPlacePress} />;
    case 'topPlaces23':
      return <TopPlaces23Card card={card} />;
    case 'peakDay':
      return <PeakDayCard card={card} />;
    case 'peakMonth':
      return <PeakMonthCard card={card} />;
    case 'mostExploredMonth':
      return <MostExploredMonthCard card={card} />;
    case 'timeOfDay':
      return <TimeOfDayCard card={card} />;
    case 'distinctPlaces':
      return <DistinctPlacesCard card={card} />;
    case 'collage':
      return <CollageCard card={card} />;
    default:
      return null;
  }
}

