const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" }
];

const OER_CORPUS = [
  // ==========================================
  // SENIOR SECONDARY - MATHEMATICS
  // ==========================================
  {
    id: "curriculum-math-12-calculus-integrals",
    title: "Senior Secondary Mathematics (Part II) - Chapter 7: Integrals",
    publisher: "Open Curriculum Core",
    subject: "Mathematics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 7: Integrals",
    section: "Section 7.4 - Integration by Parts & Partial Fractions",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["integrals", "integration by parts", "ILATE rule", "partial fractions", "indefinite integral", "definite integral", "substitution method"],
    summary: "Details standard methods for evaluating integrals of products of functions using the integration by parts formula: ∫ u·v dx = u ∫ v dx - ∫ [u' · (∫ v dx)] dx, choosing the first function using the ILATE priority rule.",
    content: `Integration by Parts Formula:
Let u and v be two differentiable functions of x.
∫ u(x) · v(x) dx = u(x) ∫ v(x) dx - ∫ [ du/dx · ∫ v(x) dx ] dx

The first function u(x) is selected using the ILATE priority rule:
- I : Inverse Trigonometric functions (sin⁻¹x, tan⁻¹x)
- L : Logarithmic functions (log x, ln x)
- A : Algebraic functions (x, x², 3x+1)
- T : Trigonometric functions (sin x, cos x, tan x)
- E : Exponential functions (eˣ, aˣ)

Example: Evaluate ∫ x · eˣ dx:
- Let u = x (Algebraic, higher in ILATE) and v = eˣ (Exponential).
- du/dx = 1, ∫ eˣ dx = eˣ.
- ∫ x · eˣ dx = x · eˣ - ∫ (1 · eˣ) dx = x · eˣ - eˣ + C = eˣ(x - 1) + C.`
  },
  {
    id: "curriculum-math-12-matrices-determinants",
    title: "Senior Secondary Mathematics (Part I) - Chapter 4: Determinants",
    publisher: "Open Curriculum Core",
    subject: "Mathematics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 4: Determinants",
    section: "Section 4.5 - Adjoint and Inverse of a Matrix",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["matrices", "determinants", "inverse of matrix", "adjoint of matrix", "cofactor matrix", "singular matrix", "system of linear equations"],
    summary: "Defines the adjoint and inverse of a square matrix. A square matrix A has an inverse if and only if |A| ≠ 0 (non-singular matrix), given by A⁻¹ = (1/|A|) · adj(A).",
    content: `Adjoint and Inverse of a Matrix:
1. Minors and Cofactors:
   - Minor M_ij is the determinant of the submatrix left after deleting the i-th row and j-th column.
   - Cofactor A_ij = (-1)^(i+j) · M_ij.
2. Adjoint of Matrix A:
   - adj(A) is the transpose of the cofactor matrix [A_ij]^T.
3. Inverse Matrix A⁻¹:
   - For a square matrix A to be invertible, |A| ≠ 0.
   - A · adj(A) = adj(A) · A = |A| · I.
   - A⁻¹ = (1 / |A|) · adj(A).
4. Application: Solving system of linear equations AX = B => X = A⁻¹ B.`
  },
  {
    id: "curriculum-math-12-vectors-3d",
    title: "Senior Secondary Mathematics (Part II) - Chapter 10 & 11: Vectors & 3D Geometry",
    publisher: "Open Curriculum Core",
    subject: "Mathematics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 10: Vector Algebra & 3D Geometry",
    section: "Section 10.4 - Scalar (Dot) and Vector (Cross) Product",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["vectors", "dot product", "cross product", "magnitude", "direction cosines", "orthogonal vectors", "angle between vectors"],
    summary: "Covers dot product a·b = |a||b|cos(θ) and cross product a×b = |a||b|sin(θ)n̂, condition for orthogonality (a·b = 0) and collinearity (a×b = 0).",
    content: `Vector Products:
1. Scalar (Dot) Product:
   - a · b = |a| |b| cos θ = a₁b₁ + a₂b₂ + a₃b₃.
   - Two non-zero vectors are perpendicular if and only if a · b = 0.
   - Projection of vector a on vector b = (a · b) / |b|.
2. Vector (Cross) Product:
   - a × b = |a| |b| sin θ n̂ (where n̂ is a unit vector perpendicular to both a and b).
   - In determinant form: a × b = | i j k ; a₁ a₂ a₃ ; b₁ b₂ b₃ |.
   - Two non-zero vectors are parallel/collinear if and only if a × b = 0.`
  },
  // ==========================================
  // SENIOR SECONDARY - PHYSICS
  // ==========================================
  {
    id: "curriculum-phys-12-electrostatics",
    title: "Senior Secondary Physics (Part I) - Chapter 1 & 2: Electrostatics",
    publisher: "Open Curriculum Core",
    subject: "Physics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 1: Electric Charges and Fields",
    section: "Section 1.6 & 1.14 - Coulomb's Law and Gauss's Law",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["electrostatics", "coulombs law", "electric field", "gauss law", "electric flux", "permittivity", "point charge"],
    summary: "Formulates electrostatic force between charges via Coulomb's Law F = (1/4πε₀) · (q₁q₂/r²) and total electric flux through any closed Gaussian surface Φ = ∮ E·dA = q_enclosed / ε₀.",
    content: `Coulomb's Law:
The electrostatic force F between two stationary point charges q₁ and q₂ in vacuum separated by distance r is:
F = (1 / 4πε₀) · (|q₁ · q₂| / r²)
Where ε₀ is the permittivity of free space = 8.854 × 10⁻¹² C² N⁻¹ m⁻², and 1/(4πε₀) ≈ 9 × 10⁹ N m² C⁻².

Gauss's Law in Electrostatics:
The total electric flux Φ through any closed surface is equal to 1/ε₀ times the total electric charge q enclosed by that surface:
Φ = ∮ E · dA = q_enclosed / ε₀

Applications of Gauss's Law:
1. Electric field due to an infinitely long straight charged wire: E = λ / (2πε₀r).
2. Electric field due to an infinite uniformly charged plane sheet: E = σ / (2ε₀).
3. Electric field due to a uniformly charged thin spherical shell: E = 0 inside, E = q / (4πε₀r²) outside.`
  },
  {
    id: "curriculum-phys-12-current-electricity",
    title: "Senior Secondary Physics (Part I) - Chapter 3: Current Electricity",
    publisher: "Open Curriculum Core",
    subject: "Physics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 3: Current Electricity",
    section: "Section 3.9 & 3.10 - Kirchhoff's Rules and Wheatstone Bridge",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["current electricity", "kirchhoffs rules", "junction rule", "loop rule", "wheatstone bridge", "drift velocity", "internal resistance"],
    summary: "Explains Kirchhoff's Junction Rule (conservation of charge, ΣI = 0) and Loop Rule (conservation of energy, ΣΔV = 0), and the balanced condition for a Wheatstone bridge (P/Q = R/S).",
    content: `Kirchhoff's Rules for Electrical Networks:
1. Kirchhoff's First Rule (Junction Rule / KCL):
   - At any junction in an electrical circuit, the sum of currents entering the junction is equal to the sum of currents leaving the junction (Conservation of Charge): Σ I = 0.
2. Kirchhoff's Second Rule (Loop Rule / KVL):
   - The algebraic sum of changes in potential around any closed circuit loop involving resistors and cells in the loop is zero (Conservation of Energy): Σ ΔV = 0 or Σ E = Σ (I · R).

Sign Convention:
- Moving in the direction of current across resistor: Potential drops by -I·R.
- Moving opposite to current across resistor: Potential increases by +I·R.
- Moving from negative to positive terminal of cell: Potential changes by +E.

Wheatstone Bridge Balanced Condition:
For four resistors P, Q, R, S connected in a diamond loop with a galvanometer:
When no current flows through galvanometer (I_g = 0), the bridge is balanced:
P / Q = R / S.`
  },
  {
    id: "curriculum-phys-12-optics-wave",
    title: "Senior Secondary Physics (Part II) - Chapter 10: Wave Optics",
    publisher: "Open Curriculum Core",
    subject: "Physics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 10: Wave Optics",
    section: "Section 10.3 & 10.4 - Huygens Principle & Young's Double Slit Experiment",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["wave optics", "huygens principle", "wavefront", "interference of light", "youngs double slit", "fringe width", "constructive interference", "destructive interference"],
    summary: "Covers wave nature of light, wavefront construction using Huygens principle, interference of light waves, condition for bright and dark fringes, and fringe width β = λD/d.",
    content: `Young's Double Slit Experiment (YDSE):
Light of wavelength λ passes through two coherent narrow slits separated by distance d, creating an interference pattern on a screen at distance D.

Conditions for Interference:
1. Constructive Interference (Bright Fringes / Maxima):
   - Path difference Δx = n · λ (where n = 0, 1, 2, 3...)
   - Position of n-th bright fringe from center: y_n = (n · λ · D) / d.
2. Destructive Interference (Dark Fringes / Minima):
   - Path difference Δx = (2n - 1) · (λ / 2) (where n = 1, 2, 3...)
   - Position of n-th dark fringe from center: y_n' = (2n - 1) · (λ · D) / (2d).

Fringe Width (β):
The distance between any two successive bright fringes or any two successive dark fringes:
β = (λ · D) / d.`
  },
  // ==========================================
  // SENIOR SECONDARY - CHEMISTRY
  // ==========================================
  {
    id: "curriculum-chem-12-electrochem",
    title: "Senior Secondary Chemistry (Part I) - Chapter 3: Electrochemistry",
    publisher: "Open Curriculum Core",
    subject: "Chemistry",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 3: Electrochemistry",
    section: "Section 3.3 - Nernst Equation & Gibbs Energy of Reaction",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["electrochemistry", "nernst equation", "electrode potential", "emf of cell", "gibbs free energy", "equilibrium constant", "galvanic cell"],
    summary: "Explains dependence of electrode and cell potential on ion concentration via Nernst Equation E_cell = E°_cell - (0.0591/n) · log Q at 298 K, and relationship ΔG° = -n F E°_cell.",
    content: `Nernst Equation:
For a general electrochemical redox reaction:
a A + b B → c C + d D (involving n moles of electrons transferred)

The cell potential E_cell under non-standard concentrations is:
E_cell = E°_cell - (RT / nF) · ln( [C]^c [D]^d / [A]^a [B]^b )

At standard temperature T = 298 K (25°C):
E_cell = E°_cell - (0.0591 / n) · log₁₀ Q

Where:
- E°_cell = Standard EMF of cell = E°_cathode - E°_anode
- n = Number of electrons transferred in balanced redox equation
- Q = Reaction quotient = [Products] / [Reactants]
- F = Faraday constant ≈ 96485 C mol⁻¹

Thermodynamics of Cell:
ΔG° = -n · F · E°_cell
log K_c = (n · E°_cell) / 0.0591`
  },
  {
    id: "curriculum-chem-12-organic-haloalkanes",
    title: "Senior Secondary Chemistry (Part II) - Chapter 10: Haloalkanes and Haloarenes",
    publisher: "Open Curriculum Core",
    subject: "Chemistry",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 10: Haloalkanes and Haloarenes",
    section: "Section 10.4 - Nucleophilic Substitution Reactions (SN1 vs SN2)",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["organic chemistry", "haloalkanes", "nucleophilic substitution", "SN1 reaction", "SN2 reaction", "carbocation", "walden inversion", "racemization"],
    summary: "Compares bimolecular (SN2) and unimolecular (SN1) nucleophilic substitution mechanisms, stereochemical inversion vs racemization, and substrate reactivity order.",
    content: `Nucleophilic Substitution Mechanisms in Haloalkanes (R-X):

1. SN2 Mechanism (Substitution Nucleophilic Bimolecular):
   - Single-step concerted mechanism with a 5-coordinate transition state.
   - Rate Law: Rate = k [R-X] [Nu⁻] (Second-order kinetics).
   - Stereochemistry: 100% Inversion of configuration (Walden Inversion).
   - Substrate Reactivity Order (Steric Hindrance governs):
     Methyl halide > 1° (Primary) > 2° (Secondary) > 3° (Tertiary).

2. SN1 Mechanism (Substitution Nucleophilic Unimolecular):
   - Two-step mechanism involving carbocation intermediate formation in rate-determining step.
   - Step 1 (Slow): R-X → R⁺ + X⁻ (Carbocation formation).
   - Step 2 (Fast): R⁺ + Nu⁻ → R-Nu.
   - Rate Law: Rate = k [R-X] (First-order kinetics).
   - Stereochemistry: Racemization (mixture of retention and inversion due to planar carbocation).
   - Substrate Reactivity Order (Carbocation Stability governs):
     3° (Tertiary) > 2° (Secondary) > 1° (Primary) > Methyl halide.`
  },
  // ==========================================
  // SENIOR SECONDARY - BIOLOGY
  // ==========================================
  {
    id: "curriculum-bio-12-genetics-dna",
    title: "Senior Secondary Biology - Chapter 6: Molecular Basis of Inheritance",
    publisher: "Open Curriculum Core",
    subject: "Biology",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 6: Molecular Basis of Inheritance",
    section: "Section 6.4 & 6.5 - DNA Replication, Transcription & Central Dogma",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["genetics", "DNA replication", "central dogma", "transcription", "translation", "semiconservative replication", "RNA polymerase", "codons"],
    summary: "Explains double helix structure, semiconservative DNA replication, and transcription of genetic information from DNA to mRNA to proteins.",
    content: `Central Dogma of Molecular Biology:
DNA ──(Transcription)──> mRNA ──(Translation)──> Protein

1. Semiconservative DNA Replication:
   - Each daughter DNA molecule retains one parental strand and one newly synthesized strand.
   - DNA-dependent DNA polymerase synthesizes in 5' → 3' direction, creating a leading (continuous) and lagging (Okazaki fragments joined by DNA ligase) strand.

2. Transcription:
   - The process of copying genetic information from one strand of DNA into RNA.
   - Transcription unit contains: Promoter, Structural gene, Terminator.
   - DNA-dependent RNA polymerase binds at promoter and catalyzes polymerization in 5' → 3' direction.
   - In eukaryotes: RNA splicing removes non-coding introns and joins coding exons.`
  },
  {
    id: "curriculum-bio-12-biotech-pcr",
    title: "Senior Secondary Biology - Chapter 11: Biotechnology Principles & Processes",
    publisher: "Open Curriculum Core",
    subject: "Biology",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 11: Biotechnology - Principles and Processes",
    section: "Section 11.2 - Recombinant DNA Technology & PCR",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["biotechnology", "PCR", "polymerase chain reaction", "restriction enzymes", "DNA ligase", "taq polymerase", "gel electrophoresis", "plasmids"],
    summary: "Covers core tools of recombinant DNA technology including restriction endonucleases and in vitro DNA amplification using Polymerase Chain Reaction (PCR).",
    content: `Polymerase Chain Reaction (PCR):
PCR is used to amplify a specific segment of DNA by billion-fold in vitro using 3 cyclic steps:

1. Denaturation:
   - Double-stranded target DNA is heated to high temperature (~94°C) to separate into single strands by breaking hydrogen bonds.
2. Annealing:
   - Temperature is lowered (~50-55°C) to allow two sets of oligonucleotide primers to hybridize/bind to complementary sequences on DNA templates.
3. Extension:
   - Thermostable DNA polymerase (Taq polymerase isolated from bacterium Thermus aquaticus) extends primers using dNTPs at ~72°C.

If process is repeated 30 cycles, approximately 1 billion copies (2³⁰) of the DNA fragment are synthesized.`
  },
  // ==========================================
  // GRADE 11 CURRICULUM - MATHEMATICS
  // ==========================================
  {
    id: "curriculum-math-11-calculus-derivatives",
    title: "Grade 11 Mathematics - Chapter 13: Limits and Derivatives",
    publisher: "Open Curriculum Core",
    subject: "Mathematics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 13: Limits and Derivatives",
    section: "Section 13.5 - First Principle of Differentiation",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["calculus", "derivatives", "limits", "first principle", "differentiation", "slope of tangent", "product rule", "quotient rule"],
    summary: "Introduces the fundamental concept of derivative as the instantaneous rate of change and limit of difference quotient: f'(x) = lim (h→0) [f(x+h) - f(x)] / h.",
    content: `Derivative from First Principle:
The derivative of a function f(x) with respect to x at any point x is defined as:
f'(x) = d/dx [f(x)] = lim (h → 0) [ f(x + h) - f(x) ] / h

Standard Derivatives:
- d/dx (xⁿ) = n · xⁿ⁻¹
- d/dx (sin x) = cos x
- d/dx (cos x) = -sin x
- d/dx (tan x) = sec² x
- d/dx (eˣ) = eˣ
- d/dx (ln x) = 1/x

Algebra of Derivatives:
1. Product Rule: d/dx [u · v] = u · (dv/dx) + v · (du/dx)
2. Quotient Rule: d/dx [u / v] = [ v · (du/dx) - u · (dv/dx) ] / v²`
  },
  {
    id: "curriculum-math-11-trigonometry",
    title: "Grade 11 Mathematics - Chapter 3: Trigonometric Functions",
    publisher: "Open Curriculum Core",
    subject: "Mathematics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 3: Trigonometric Functions",
    section: "Section 3.3 - Trigonometric Functions of Sum and Difference of Two Angles",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["trigonometry", "compound angles", "sin(A+B)", "cos(A+B)", "double angle formulas", "radians", "unit circle"],
    summary: "Derives standard trigonometric identities for sum, difference, and double angles including sin(x+y), cos(x+y), sin 2x = 2 sin x cos x, and cos 2x = cos²x - sin²x.",
    content: `Trigonometric Identities of Compound Angles:
1. Sum and Difference:
   - sin(x + y) = sin x cos y + cos x sin y
   - sin(x - y) = sin x cos y - cos x sin y
   - cos(x + y) = cos x cos y - sin x sin y
   - cos(x - y) = cos x cos y + sin x sin y
   - tan(x + y) = (tan x + tan y) / (1 - tan x tan y)

2. Double Angle Formulas:
   - sin 2x = 2 sin x cos x = (2 tan x) / (1 + tan² x)
   - cos 2x = cos² x - sin² x = 2 cos² x - 1 = 1 - 2 sin² x = (1 - tan² x) / (1 + tan² x)
   - tan 2x = (2 tan x) / (1 - tan² x)`
  },
  // ==========================================
  // GRADE 11 CURRICULUM - PHYSICS
  // ==========================================
  {
    id: "curriculum-phys-11-kinematics-projectile",
    title: "Grade 11 Physics (Part I) - Chapter 4: Motion in a Plane",
    publisher: "Open Curriculum Core",
    subject: "Physics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 4: Motion in a Plane",
    section: "Section 4.10 - Projectile Motion",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["physics", "kinematics", "projectile motion", "time of flight", "maximum height", "horizontal range", "trajectory parabola", "initial velocity"],
    summary: "Analyzes motion of an object projected with velocity u at angle θ to the horizontal under uniform gravitational acceleration g, resolving into independent horizontal and vertical components.",
    content: `Projectile Motion Formulation:
Initial velocity u is resolved into components:
- Horizontal component: u_x = u cos θ (constant throughout motion, a_x = 0).
- Vertical component: u_y = u sin θ (subject to gravity a_y = -g).

Equation of Trajectory:
y = (tan θ) x - [ g / (2 u² cos² θ) ] x² (represents a Parabola).

Key Kinematic Results:
1. Time of Flight (T):
   T = (2 u sin θ) / g
2. Maximum Height Reached (H):
   H = (u² sin² θ) / (2g)
3. Horizontal Range (R):
   R = (u² sin 2θ) / g
   - Maximum range occurs at launch angle θ = 45°, where R_max = u² / g.
   - For complementary angles (θ and 90° - θ), horizontal range is identical.`
  },
  {
    id: "curriculum-phys-11-thermo-first-law",
    title: "Grade 11 Physics (Part II) - Chapter 12: Thermodynamics",
    publisher: "Open Curriculum Core",
    subject: "Physics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 12: Thermodynamics",
    section: "Section 12.5 - First Law of Thermodynamics and Thermodynamic State Variables",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["physics", "thermodynamics", "first law of thermodynamics", "internal energy", "heat Q", "work done W", "isothermal process", "adiabatic process"],
    summary: "The First Law of Thermodynamics states that heat ΔQ supplied to a system equals the sum of increase in its internal energy ΔU and work ΔW done by the system on its surroundings (ΔQ = ΔU + ΔW).",
    content: `First Law of Thermodynamics:
ΔQ = ΔU + ΔW
Where:
- ΔQ = Heat supplied to the system by surroundings (+ve if heat added, -ve if heat released).
- ΔU = Change in internal energy (for an ideal gas, U depends only on temperature T: ΔU = n C_v ΔT).
- ΔW = Work done by the system on surroundings = P · ΔV (+ve for expansion, -ve for compression).

Application to Thermodynamic Processes:
1. Isothermal Process (Constant Temperature T = const, ΔT = 0):
   - Internal energy change ΔU = 0 => ΔQ = ΔW = nRT ln(V₂ / V₁).
2. Isochoric Process (Constant Volume V = const, ΔV = 0):
   - Work done ΔW = 0 => ΔQ = ΔU = n C_v ΔT.
3. Isobaric Process (Constant Pressure P = const):
   - ΔW = P (V₂ - V₁) => ΔQ = n C_p ΔT.
4. Adiabatic Process (No heat exchange ΔQ = 0):
   - ΔU = -ΔW => Work done by gas decreases its internal energy and temperature.`
  },
  // ==========================================
  // GRADE 11 CURRICULUM - CHEMISTRY
  // ==========================================
  {
    id: "curriculum-chem-11-stoichiometry-mole",
    title: "Grade 11 Chemistry (Part I) - Chapter 1: Some Basic Concepts of Chemistry",
    publisher: "Open Curriculum Core",
    subject: "Chemistry",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 1: Some Basic Concepts of Chemistry",
    section: "Section 1.8 & 1.9 - Mole Concept, Molar Mass and Limiting Reagent",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["chemistry", "mole concept", "avogadro number", "molar mass", "stoichiometry", "limiting reagent", "empirical formula", "percentage composition"],
    summary: "Defines 1 mole as containing 6.022 × 10²³ elementary entities (Avogadro Constant N_A) and calculates stoichiometric product yields determined by the limiting reagent.",
    content: `Mole Concept and Stoichiometric Calculations:
1. Mole Definition:
   - One mole is the amount of substance that contains 6.022 × 10²³ particles (atoms, molecules, or ions).
   - Number of Moles (n) = Given Mass (m) / Molar Mass (M) = Number of particles / N_A.

2. Stoichiometric Calculations in Chemical Equations:
   - Example: N₂(g) + 3 H₂(g) → 2 NH₃(g)
   - 1 mole of N₂ reacts with 3 moles of H₂ to produce 2 moles of NH₃.

3. Limiting Reagent (LR):
   - The reactant which gets completely consumed first in a reaction is called the Limiting Reagent. It limits the maximum amount of product that can be formed.
   - Identification Rule: Divide moles of each reactant by its stoichiometric coefficient in the balanced equation. The reactant with the lowest ratio is the Limiting Reagent.`
  },
  {
    id: "curriculum-chem-11-chemical-bonding",
    title: "Grade 11 Chemistry (Part I) - Chapter 4: Chemical Bonding & Molecular Structure",
    publisher: "Open Curriculum Core",
    subject: "Chemistry",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 4: Chemical Bonding and Molecular Structure",
    section: "Section 4.3 & 4.6 - VSEPR Theory and Hybridization (sp, sp², sp³)",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["chemistry", "chemical bonding", "vsepr theory", "hybridization", "sp3 hybridization", "lone pair repulsion", "molecular geometry", "bond angle"],
    summary: "Predicts 3D shapes of covalent molecules using Valence Shell Electron Pair Repulsion (VSEPR) theory and atomic orbital hybridization concepts (sp, sp², sp³, sp³d).",
    content: `VSEPR Theory and Orbital Hybridization:
1. VSEPR Theory Postulates:
   - Electron pairs in the valence shell repel one another and stay as far apart as possible to minimize repulsion.
   - Order of repulsive forces: Lone Pair - Lone Pair (lp-lp) > Lone Pair - Bond Pair (lp-bp) > Bond Pair - Bond Pair (bp-bp).

2. Molecular Geometries and Hybridization:
   - sp (Steric number 2): Linear geometry, 180° bond angle (e.g. BeCl₂, C₂H₂).
   - sp² (Steric number 3): Trigonal planar, 120° bond angle (e.g. BF₃, C₂H₄).
   - sp³ (Steric number 4):
     * 4 bond pairs, 0 lone pairs: Regular Tetrahedral, 109.5° (e.g. CH₄).
     * 3 bond pairs, 1 lone pair: Trigonal Pyramidal, 107° (e.g. NH₃ - lone pair compresses angle).
     * 2 bond pairs, 2 lone pairs: Bent / V-shaped, 104.5° (e.g. H₂O).`
  },
  // ==========================================
  // GRADE 11 CURRICULUM - BIOLOGY
  // ==========================================
  {
    id: "curriculum-bio-11-cell-unit-life",
    title: "Grade 11 Biology - Chapter 8: Cell - The Unit of Life",
    publisher: "Open Curriculum Core",
    subject: "Biology",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 8: Cell - The Unit of Life",
    section: "Section 8.5 - Eukaryotic Cell Organelles (Mitochondria, Chloroplasts, ER, Golgi)",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["biology", "cell biology", "mitochondria", "chloroplast", "endoplasmic reticulum", "golgi apparatus", "fluid mosaic model", "plasma membrane"],
    summary: "Explains fluid mosaic model of plasma membrane and endomembrane system organelles including ATP synthesis in mitochondria and photosynthetic thylakoids in chloroplasts.",
    content: `Eukaryotic Cell Structure & Organelles:
1. Plasma Membrane (Fluid Mosaic Model):
   - Phospholipid bilayer with polar hydrophilic heads facing outward and non-polar hydrophobic fatty acid tails facing inward.
   - Quasi-fluid nature of lipids enables lateral movement of integral and peripheral proteins within the bilayer.

2. Mitochondria (Powerhouse of the Cell):
   - Double membrane-bound organelle. Inner membrane folded into cristae to increase surface area for ATP synthase (F₀-F₁ particles).
   - Site of aerobic respiration and cellular ATP production via Krebs cycle and electron transport chain. Contains circular DNA and 70S ribosomes.

3. Chloroplasts:
   - Double membrane organelle containing stroma and membrane sacs called thylakoids arranged in stacks called grana. Thylakoid membranes harbor chlorophyll for light absorption.`
  },
  {
    id: "curriculum-bio-11-plant-photosynthesis",
    title: "Grade 11 Biology - Chapter 13: Photosynthesis in Higher Plants",
    publisher: "Open Curriculum Core",
    subject: "Biology",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 13: Photosynthesis in Higher Plants",
    section: "Section 13.6 & 13.7 - Light Reaction, Z-Scheme and Calvin Cycle (C3 pathway)",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["biology", "photosynthesis", "light reaction", "z scheme", "calvin cycle", "c3 cycle", "rubisco", "atp nadph", "photolysis of water"],
    summary: "Explains photochemical light reaction with non-cyclic photophosphorylation (Z-scheme) and dark reaction Calvin C3 cycle driven by enzyme RuBisCO in the stroma.",
    content: `Photosynthesis in Higher Plants:
1. Light Reactions (Photochemical Phase):
   - Occur in thylakoid membranes.
   - Photosystem II (P680) absorbs light at 680 nm, causing photolysis of water: 2 H₂O → 4 H⁺ + O₂ + 4 e⁻.
   - Electrons pass along electron transport chain to Photosystem I (P700) creating proton gradient across thylakoid membrane to synthesize ATP and NADPH (Z-Scheme).

2. Calvin Cycle (C3 Pathway / Dark Reaction in Stroma):
   - Step 1: Carboxylation: CO₂ combines with Ribulose-1,5-bisphosphate (RuBP) catalyzed by RuBisCO to form 2 molecules of 3-Phosphoglyceric acid (3-PGA).
   - Step 2: Reduction: 3-PGA is reduced using 2 ATP and 2 NADPH per CO₂ fixed to form Triose phosphate (Glucose precursor).
   - Step 3: Regeneration: Regeneration of RuBP requires 1 ATP.
   - Net balance: For synthesis of 1 glucose molecule (C₆H₁₂O₆), 6 turns of Calvin cycle consume 6 CO₂, 18 ATP, and 12 NADPH.`
  },
  // ==========================================
  // SECONDARY CURRICULUM (GRADES 9 & 10)
  // ==========================================
  {
    id: "curriculum-math-9-linear-eq",
    title: "Grade 9 Mathematics - Chapter 4: Linear Equations in Two Variables",
    publisher: "Open Curriculum Core",
    subject: "Mathematics",
    gradeLevel: "Grade 9-10",
    chapter: "Chapter 4: Linear Equations in Two Variables",
    section: "Section 4.2 - General Form and Graphical Solutions",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["mathematics", "linear equations", "two variables", "ax + by + c = 0", "graph of linear equation", "substitution method", "coordinate geometry"],
    summary: "Explains linear equation ax + by + c = 0 where a, b are not both zero. A linear equation in two variables has infinitely many solutions forming a straight line on a graph.",
    content: `An equation of the form ax + by + c = 0, where a, b and c are real numbers, such that a and b are not both zero, is called a linear equation in two variables.
Every solution (x, y) corresponds to a unique point on the straight line representing the equation.
Example: For 2x + 3y = 12:
- If x = 0 => 3y = 12 => y = 4 (Point: 0, 4)
- If y = 0 => 2x = 12 => x = 6 (Point: 6, 0)
- If x = 3 => 2(3) + 3y = 12 => y = 2 (Point: 3, 2).`
  },
  {
    id: "curriculum-phys-9-newton-laws",
    title: "Grade 9 Science (Physics) - Chapter 9: Force and Laws of Motion",
    publisher: "Open Curriculum Core",
    subject: "Physics",
    gradeLevel: "Grade 9-10",
    chapter: "Chapter 9: Force and Laws of Motion",
    section: "Section 9.3 - Newton's Second Law of Motion and Momentum",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["physics", "newton laws of motion", "force", "momentum", "acceleration", "F=ma", "inertia", "impulse"],
    summary: "Newton's Second Law states that the rate of change of momentum is proportional to the applied unbalanced force in the direction of force (F = m × a).",
    content: `Laws of Motion:
1. First Law (Inertia): An object remains at rest or uniform motion unless acted upon by an external unbalanced force.
2. Second Law: The rate of change of momentum of an object is proportional to the applied force in the direction of force.
   - Momentum p = m · v.
   - Force F = Δp / Δt = m(v - u) / t = m · a (Force in Newtons, mass in kg, acceleration in m/s²).
3. Third Law: To every action, there is an equal and opposite reaction.`
  },
  {
    id: "curriculum-chem-10-acids-bases",
    title: "Grade 10 Science (Chemistry) - Chapter 2: Acids, Bases and Salts",
    publisher: "Open Curriculum Core",
    subject: "Chemistry",
    gradeLevel: "Grade 9-10",
    chapter: "Chapter 2: Acids, Bases and Salts",
    section: "Section 2.3 - The pH Scale and Neutralization",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["chemistry", "acids", "bases", "pH scale", "neutralization", "hydrogen ions H+", "hydroxide ions OH-", "salts"],
    summary: "Measures hydrogen ion concentration [H⁺] on pH scale from 0 to 14. Neutralization reaction: Acid + Base → Salt + Water.",
    content: `Acids produce H⁺ ions in aqueous solution. Bases produce OH⁻ ions in aqueous solution.
pH Scale:
- Measures [H⁺] concentration. pH = -log₁₀[H⁺].
- pH = 7: Neutral solution.
- pH < 7: Acidic solution (lower value = stronger acid).
- pH > 7: Basic solution (higher value = stronger base).
Neutralization Reaction: HCl + NaOH → NaCl + H₂O.`
  },
  {
    id: "curriculum-bio-10-life-processes",
    title: "Grade 10 Science (Biology) - Chapter 6: Life Processes",
    publisher: "Open Curriculum Core",
    subject: "Biology",
    gradeLevel: "Grade 9-10",
    chapter: "Chapter 6: Life Processes",
    section: "Section 6.2 - Autotrophic Nutrition & Photosynthesis",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["biology", "photosynthesis", "chlorophyll", "stomata", "glucose", "light reaction", "guard cells"],
    summary: "Explains photosynthesis equation 6 CO₂ + 12 H₂O + light + chlorophyll → C₆H₁₂O₆ + 6 O₂ + 6 H₂O and stomatal gas exchange regulation.",
    content: `Photosynthesis Equation:
6 CO₂ + 12 H₂O + Sunlight + Chlorophyll → C₆H₁₂O₆ (Glucose) + 6 O₂ + 6 H₂O
Key Events:
1. Absorption of light by chlorophyll.
2. Photolysis of water: Splitting water into hydrogen and oxygen.
3. Reduction of carbon dioxide to carbohydrates.`
  },
  // ==========================================
  // MIDDLE YEARS FOUNDATIONS (GRADES 6 - 8)
  // ==========================================
  {
    id: "curriculum-math-7-fractions",
    title: "Grade 7 Mathematics - Chapter 2: Fractions and Decimals",
    publisher: "Open Curriculum Core",
    subject: "Mathematics",
    gradeLevel: "Grade 6-8",
    chapter: "Chapter 2: Fractions and Decimals",
    section: "Section 2.2 - Addition and Subtraction of Unlike Fractions",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["mathematics", "fractions", "unlike fractions", "LCM", "equivalent fractions", "addition of fractions"],
    summary: "Step-by-step arithmetic for adding and subtracting unlike fractions by finding the Least Common Multiple (LCM) of denominators.",
    content: `To add unlike fractions:
1. Find the LCM of denominators.
2. Convert fractions into equivalent fractions with LCM as common denominator.
3. Add numerators and simplify.
Example: 2/3 + 3/5 => LCM of 3 and 5 is 15.
2/3 = 10/15, 3/5 = 9/15.
Sum = (10 + 9)/15 = 19/15 = 1 4/15.`
  },
  {
    id: "curriculum-math-8-mensuration",
    title: "Grade 8 Mathematics - Chapter 11: Mensuration",
    publisher: "Open Curriculum Core",
    subject: "Mathematics",
    gradeLevel: "Grade 6-8",
    chapter: "Chapter 11: Mensuration",
    section: "Section 11.4 - Area of Trapezium, Surface Area and Volume",
    pageOrRef: "Core Knowledge Module & Formative Reference Guide",
    license: "Open Educational Resource (CC BY-NC-SA 4.0)",
    keyConcepts: ["mathematics", "mensuration", "area of trapezium", "surface area cylinder", "volume cuboid", "geometric formulas"],
    summary: "Standard geometric formulas for 2D and 3D shapes: Area of Trapezium = 1/2(a+b)h, Volume of cylinder = πr²h, Total surface area = 2πr(r+h).",
    content: `Mensuration Formulas:
- Area of Trapezium = 1/2 × (Sum of parallel sides) × height = 1/2 · (a + b) · h.
- Cuboid: Surface Area = 2(lb + bh + hl), Volume = l · b · h.
- Cylinder: Curved Surface Area = 2πrh, Total Surface Area = 2πr(r + h), Volume = πr²h.`
  }
];

export {
  OER_CORPUS,
  SUPPORTED_LANGUAGES
};
