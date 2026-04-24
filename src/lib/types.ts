export interface Claim {
  id: string;
  text: string;
  type: 'direct_quote' | 'paraphrased_position' | 'factual_assertion';
  source: 'transcript';
}

export interface ClaimAnalysis {
  claimId: string;
  claimText: string;
  presentInArticle: boolean;
  articleRendering: string | null;
  quoteFidelity: number;
  contextRetention: number;
  editorialFraming: string | null;
  finding: string;
}

export interface VerificationResult {
  outlet: string;
  author: string;
  articleHeadline: string;
  verifiedAt: string;
  scores: {
    quoteFidelity: number;
    coverage: number;
    contextRetention: number;
    materialOmission: number;
    aggregate: number;
  };
  ratingLabel: 'Verified' | 'Fair' | 'Selective' | 'Distorted' | 'Fabricated';
  summary: string;
  topFindings: Array<{
    type: 'omission' | 'distortion' | 'accurate' | 'framing';
    description: string;
    evidence: string;
  }>;
  claimAnalyses: ClaimAnalysis[];
}
