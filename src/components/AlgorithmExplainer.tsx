import React from 'react';
import { 
  Cpu, 
  Layers, 
  MapPin, 
  Calendar, 
  FileText, 
  Tag, 
  ShieldCheck, 
  Network,
  Scale
} from 'lucide-react';

export const AlgorithmExplainer: React.FC = () => {
  return (
    <div className="space-y-6 text-black dark:text-white">
      {/* Top Hero Banner */}
      <div className="bg-black text-white dark:bg-[#111111] dark:text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-800 text-white border border-neutral-700 text-xs font-bold mb-3">
            <Cpu className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Academic Architecture & Algorithmic Specification</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mb-2">
            Multi-Parameter Algorithmic Matching & Spatial Geofencing
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed font-medium">
            This digital lost-and-found system formulates pair matching as a weighted multi-objective scoring problem.
            By unifying lexical Jaccard tokenization, hierarchical categorical taxonomy, spatial Euclidean grid decay,
            and asymmetric temporal regression, the engine achieves high precision while minimizing fraudulent false positives.
          </p>
        </div>
      </div>

      {/* 5 Core Scoring Vectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Vector 1 */}
        <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white">
                <Layers className="w-5 h-5 stroke-[2.2]" />
              </span>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
                Weight: 25%
              </span>
            </div>
            <h3 className="font-black text-black dark:text-white text-sm mb-1.5">
              1. Categorical Concordance
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 font-medium">
              Hierarchical 2-level taxonomy checking (Domain Category + Subcategory Type).
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 space-y-1">
              <div>S_cat = 100 (if Cat == Cat' && Sub == Sub')</div>
              <div>S_cat = 80  (if Cat == Cat' && Sub != Sub')</div>
              <div>S_cat = 35  (if Soft Affinity Overlap)</div>
              <div>S_cat = 0   (if Mutually Incompatible)</div>
            </div>
          </div>
        </div>

        {/* Vector 2 */}
        <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white">
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </span>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
                Weight: 30%
              </span>
            </div>
            <h3 className="font-black text-black dark:text-white text-sm mb-1.5">
              2. Lexical Jaccard & N-Gram Tokenization
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 font-medium">
              Tokenization of titles, descriptions, and markings with stop-word filtration and key-feature weighting.
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 space-y-1">
              <div>J(A, B) = |Tokens(A) ∩ Tokens(B)| / |Tokens(A) ∪ Tokens(B)|</div>
              <div>Distinctive Marks Bonus: +10% per unique feature overlap</div>
              <div>Levenshtein fuzzy matching for brand strings</div>
            </div>
          </div>
        </div>

        {/* Vector 3 */}
        <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white">
                <Tag className="w-5 h-5 stroke-[2.2]" />
              </span>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
                Weight: 20%
              </span>
            </div>
            <h3 className="font-black text-black dark:text-white text-sm mb-1.5">
              3. Visual & Physical Attributes
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 font-medium">
              Color cluster affinity (grouping colors by spectrum family) and manufacturer brand normalization.
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 space-y-1">
              <div>Color_Score: 100 (Exact), 80 (Family: Gray/Silver/Slate)</div>
              <div>Brand_Score: 100 (Match), 0 (Conflict: Apple vs Dell)</div>
              <div>S_attr = 0.5 * S_color + 0.5 * S_brand</div>
            </div>
          </div>
        </div>

        {/* Vector 4 */}
        <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white">
                <MapPin className="w-5 h-5 stroke-[2.2]" />
              </span>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
                Weight: 15%
              </span>
            </div>
            <h3 className="font-black text-black dark:text-white text-sm mb-1.5">
              4. Spatial Grid & Geofencing
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 font-medium">
              Campus 2D coordinate Euclidean distance d = √((x1-x2)² + (y1-y2)²), with intra-building floor bonus.
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 space-y-1">
              <div>Same Zone & Floor: 100%</div>
              <div>Same Building Different Floor: 85%</div>
              <div>S_spatial = max(0, 100 - (Distance * 1.5))</div>
            </div>
          </div>
        </div>

        {/* Vector 5 */}
        <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white">
                <Calendar className="w-5 h-5 stroke-[2.2]" />
              </span>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
                Weight: 10%
              </span>
            </div>
            <h3 className="font-black text-black dark:text-white text-sm mb-1.5">
              5. Temporal Decay Model
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 font-medium">
              Asymmetric time decay modeling causality: found items discovered after loss report receive highest affinity.
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 space-y-1">
              <div>Δt = (t_found - t_lost) in days</div>
              <div>0 ≤ Δt ≤ 1 day: 100% | ≤ 3 days: 85%</div>
              <div>Δt &lt; 0 (Reporting latency): 65% decay baseline</div>
            </div>
          </div>
        </div>

        {/* Composite Equation Card */}
        <div className="bg-black text-white dark:bg-[#111111] p-5 rounded-xl border border-neutral-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-lg bg-neutral-800 text-white">
                <Scale className="w-5 h-5 stroke-[2.2]" />
              </span>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-white text-black">
                Composite Score
              </span>
            </div>
            <h3 className="font-black text-white text-sm mb-1.5">
              Master Composite Formulation
            </h3>
            <p className="text-xs text-neutral-300 mb-3 font-medium">
              Weighted convex sum yielding a normalized affinity metric from 0% to 100%.
            </p>
            <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-700 font-mono text-[11px] text-white space-y-1">
              <div>Score = 0.25·S_cat + 0.30·S_text +</div>
              <div>        0.20·S_attr + 0.15·S_space +</div>
              <div>        0.10·S_temp</div>
              <div className="text-neutral-400 pt-1">Confidence: High (≥75%), Mod (50-74%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Complex Data Relationships & Entity-Relationship Schema */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-6 border border-neutral-300 dark:border-neutral-800 shadow-xs">
        <h3 className="font-black text-black dark:text-white text-sm mb-4 flex items-center">
          <Network className="w-4 h-4 mr-2 text-black dark:text-white stroke-[2.2]" />
          Complex Data Relationships & Entity-Relationship Model
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Entity: Item */}
          <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700">
            <span className="font-black text-black dark:text-white block mb-1 text-sm">Item Entity</span>
            <ul className="space-y-1 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
              <li>• id: UUID / Prefix</li>
              <li>• type: 'lost' | 'found'</li>
              <li>• category & subcategory</li>
              <li>• brand & colors</li>
              <li>• distinctiveFeatures</li>
              <li>• coordinates (x, y)</li>
              <li>• status lifecycle</li>
            </ul>
          </div>

          {/* Entity: Zone */}
          <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700">
            <span className="font-black text-black dark:text-white block mb-1 text-sm">LocationZone</span>
            <ul className="space-y-1 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
              <li>• id & code</li>
              <li>• name & venueCategory</li>
              <li>• floorTaxonomy[]</li>
              <li>• coordinates (x, y)</li>
              <li>• hotspotRiskLevel</li>
              <li>• geofenceRadius</li>
            </ul>
          </div>

          {/* Entity: Match Pair */}
          <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700">
            <span className="font-black text-black dark:text-white block mb-1 text-sm">MatchPair</span>
            <ul className="space-y-1 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
              <li>• lostItemId (FK)</li>
              <li>• foundItemId (FK)</li>
              <li>• vectorBreakdown:</li>
              <li>  - categoryScore</li>
              <li>  - textJaccardScore</li>
              <li>  - spatialDistanceMeters</li>
              <li>  - temporalDeltaDays</li>
              <li>• overallScore %</li>
            </ul>
          </div>

          {/* Entity: Claim & Custody */}
          <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700">
            <span className="font-black text-black dark:text-white block mb-1 text-sm">Claim & CustodyLog</span>
            <ul className="space-y-1 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
              <li>• claimId (FK)</li>
              <li>• claimantName & contact</li>
              <li>• submittedAnswers[]</li>
              <li>• confidentialTruth (secret)</li>
              <li>• status: pending/approved</li>
              <li>• custodyHistory[]</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Anti-Fraud Security Workflow */}
      <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl p-6 border border-neutral-300 dark:border-neutral-700">
        <h3 className="font-black text-black dark:text-white text-sm mb-2 flex items-center">
          <ShieldCheck className="w-4 h-4 mr-2 text-black dark:text-white stroke-[2.2]" />
          Anti-Fraud Blind Verification Mechanism
        </h3>
        <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
          Public lost-and-found databases often suffer from opportunistic theft if all item characteristics (such as serial numbers,
          lock screen photos, or wallet card contents) are publicly revealed. In this architecture:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
          <div className="bg-white dark:bg-black p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white">
            <strong className="text-black dark:text-white block mb-1 font-black">1. Confidential Intake Ground Truth</strong>
            During recovery intake, officers log private attributes (e.g. sticker under case, cash count) hidden from public viewers.
          </div>
          <div className="bg-white dark:bg-black p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white">
            <strong className="text-black dark:text-white block mb-1 font-black">2. Blind Question Challenge</strong>
            Claimants must answer dynamically generated questions without seeing the correct answer beforehand.
          </div>
          <div className="bg-white dark:bg-black p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white">
            <strong className="text-black dark:text-white block mb-1 font-black">3. Non-Repudiable Custody Handover</strong>
            Officers verify official student or government photo ID, record the signature handover, and lock the record in the permanent audit trail.
          </div>
        </div>
      </div>
    </div>
  );
};
