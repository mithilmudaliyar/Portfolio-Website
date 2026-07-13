export type PublicationStatus = 'published' | 'presented'

export interface Publication {
  id: string
  title: string
  venue: string
  detail: string
  year: string
  status: PublicationStatus
  url?: string
}

export const PUBLICATION_STATUS_LABELS: Record<PublicationStatus, string> = {
  published: 'Published',
  presented: 'Presented',
}

export const publications: Publication[] = [
  {
    id: 'anita-fraud-detection',
    title: 'ANITA: Advanced Novel Integration of a Tiered Aggregator for Credit Card Fraud Detection',
    venue: 'ITAI 2025, Lecture Notes in Networks and Systems vol. 1505, Springer',
    detail:
      'A stacking ensemble of Logistic Regression, Random Forest and XGBoost for credit card fraud detection under severe class imbalance, reaching 99.95% accuracy without over-sampling.',
    year: '2025',
    status: 'published',
    url: 'https://doi.org/10.1007/978-981-96-8687-2_27',
  },
  {
    id: 'yolov11-fire-human',
    title: 'YOLOv11-Based Real-Time Fire and Human Detection',
    venue: 'ICCRTEE 2026, Kalasalingam Academy of Research and Education',
    detail:
      'A YOLO11 framework for real-time fire, smoke and human detection tuned for noisy, low-cost CCTV feeds through dataset engineering and simulated image degradation.',
    year: '2026',
    status: 'presented',
  },
  {
    id: 'cost-aware-ruls',
    title: 'Cost-Aware Temporal Deep Learning for Remaining Useful Life Risk Classification in Heavy-Duty Vehicles',
    venue: 'ICCMC 2026, Surya Engineering College, Erode',
    detail:
      'A BiLSTM with attention and a cost-sensitive hybrid loss for predictive maintenance, cutting validation cost against static classifiers under industrial risk asymmetry.',
    year: '2026',
    status: 'presented',
  },
]
