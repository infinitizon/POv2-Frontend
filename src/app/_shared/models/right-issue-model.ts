export interface RightIssue {
  id:          string;
  Asset:       Asset
  assetId:     string;
  forEvery:    number;
  youGet:      number;
  sharePrice:  number;
  shortDesc:   string;
  description: string;
  startDate:   Date;
  endDate:     Date;
  createdAt:   Date;
  updatedAt:   Date;
  deletedAt:   null;
  openForPurchase: boolean;
  extRef: any;
  Media: any;
  name: any;
}

export interface Media {
  id: string;
  name: string;
  link: string;
}

export interface Asset {
  Media: Media[],
  name: string;
  currency: string;
}
