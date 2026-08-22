const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "\u0939\u093F\u0928\u094D\u0926\u0940" },
  { code: "es", name: "Spanish", nativeName: "Espa\xF1ol" },
  { code: "mr", name: "Marathi", nativeName: "\u092E\u0930\u093E\u0920\u0940" },
  { code: "bn", name: "Bengali", nativeName: "\u09AC\u09BE\u0982\u09B2\u09BE" },
  { code: "ta", name: "Tamil", nativeName: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD" },
  { code: "te", name: "Telugu", nativeName: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41" },
  { code: "gu", name: "Gujarati", nativeName: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0" }
];
const OER_CORPUS = [
  // ==========================================
  // CLASS 12 NCERT - MATHEMATICS
  // ==========================================
  {
    id: "ncert-math-12-calculus-integrals",
    title: "NCERT Class 12 Mathematics (Part II) - Chapter 7",
    publisher: "NCERT",
    subject: "Mathematics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 7: Integrals",
    section: "Section 7.4 - Integration by Parts & Partial Fractions",
    pageOrRef: "Pages 305-318 (Official NCERT Class 12 Part II)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["integrals", "integration by parts", "ILATE rule", "partial fractions", "indefinite integral", "definite integral", "substitution method"],
    summary: "Details standard methods for evaluating integrals of products of functions using the integration by parts formula: \u222B u\xB7v dx = u \u222B v dx - \u222B [u' \xB7 (\u222B v dx)] dx, choosing the first function using the ILATE priority rule.",
    content: `Integration by Parts Formula:
Let u and v be two differentiable functions of x.
\u222B u(x) \xB7 v(x) dx = u(x) \u222B v(x) dx - \u222B [ du/dx \xB7 \u222B v(x) dx ] dx

The first function u(x) is selected using the ILATE priority rule:
- I : Inverse Trigonometric functions (sin\u207B\xB9x, tan\u207B\xB9x)
- L : Logarithmic functions (log x, ln x)
- A : Algebraic functions (x, x\xB2, 3x+1)
- T : Trigonometric functions (sin x, cos x, tan x)
- E : Exponential functions (e\u02E3, a\u02E3)

Example: Evaluate \u222B x \xB7 e\u02E3 dx:
- Let u = x (Algebraic, higher in ILATE) and v = e\u02E3 (Exponential).
- du/dx = 1, \u222B e\u02E3 dx = e\u02E3.
- \u222B x \xB7 e\u02E3 dx = x \xB7 e\u02E3 - \u222B (1 \xB7 e\u02E3) dx = x \xB7 e\u02E3 - e\u02E3 + C = e\u02E3(x - 1) + C.`
  },
  {
    id: "ncert-math-12-matrices-determinants",
    title: "NCERT Class 12 Mathematics (Part I) - Chapter 4",
    publisher: "NCERT",
    subject: "Mathematics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 4: Determinants",
    section: "Section 4.5 - Adjoint and Inverse of a Matrix",
    pageOrRef: "Pages 123-134 (Official NCERT Class 12 Part I)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["matrices", "determinants", "inverse of matrix", "adjoint of matrix", "cofactor matrix", "singular matrix", "system of linear equations"],
    summary: "Defines the adjoint and inverse of a square matrix. A square matrix A has an inverse if and only if |A| \u2260 0 (non-singular matrix), given by A\u207B\xB9 = (1/|A|) \xB7 adj(A).",
    content: `Adjoint and Inverse of a Matrix:
1. Minors and Cofactors:
   - Minor M_ij is the determinant of the submatrix left after deleting the i-th row and j-th column.
   - Cofactor A_ij = (-1)^(i+j) \xB7 M_ij.
2. Adjoint of Matrix A:
   - adj(A) is the transpose of the cofactor matrix [A_ij]^T.
3. Inverse Matrix A\u207B\xB9:
   - For a square matrix A to be invertible, |A| \u2260 0.
   - A \xB7 adj(A) = adj(A) \xB7 A = |A| \xB7 I.
   - A\u207B\xB9 = (1 / |A|) \xB7 adj(A).
4. Application: Solving system of linear equations AX = B => X = A\u207B\xB9 B.`
  },
  {
    id: "ncert-math-12-vectors-3d",
    title: "NCERT Class 12 Mathematics (Part II) - Chapter 10 & 11",
    publisher: "NCERT",
    subject: "Mathematics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 10: Vector Algebra & 3D Geometry",
    section: "Section 10.4 - Scalar (Dot) and Vector (Cross) Product",
    pageOrRef: "Pages 438-450 (Official NCERT Class 12 Part II)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["vectors", "dot product", "cross product", "magnitude", "direction cosines", "orthogonal vectors", "angle between vectors"],
    summary: "Covers dot product a\xB7b = |a||b|cos(\u03B8) and cross product a\xD7b = |a||b|sin(\u03B8)n\u0302, condition for orthogonality (a\xB7b = 0) and collinearity (a\xD7b = 0).",
    content: `Vector Products:
1. Scalar (Dot) Product:
   - a \xB7 b = |a| |b| cos \u03B8 = a\u2081b\u2081 + a\u2082b\u2082 + a\u2083b\u2083.
   - Two non-zero vectors are perpendicular if and only if a \xB7 b = 0.
   - Projection of vector a on vector b = (a \xB7 b) / |b|.
2. Vector (Cross) Product:
   - a \xD7 b = |a| |b| sin \u03B8 n\u0302 (where n\u0302 is a unit vector perpendicular to both a and b).
   - In determinant form: a \xD7 b = | i j k ; a\u2081 a\u2082 a\u2083 ; b\u2081 b\u2082 b\u2083 |.
   - Two non-zero vectors are parallel/collinear if and only if a \xD7 b = 0.`
  },
  // ==========================================
  // CLASS 12 NCERT - PHYSICS
  // ==========================================
  {
    id: "ncert-phys-12-electrostatics",
    title: "NCERT Class 12 Physics (Part I) - Chapter 1 & 2",
    publisher: "NCERT",
    subject: "Physics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 1: Electric Charges and Fields",
    section: "Section 1.6 & 1.14 - Coulomb's Law and Gauss's Law",
    pageOrRef: "Pages 10-18, 33-39 (Official NCERT Class 12 Part I)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["electrostatics", "coulombs law", "electric field", "gauss law", "electric flux", "permittivity", "point charge"],
    summary: "Formulates electrostatic force between charges via Coulomb's Law F = (1/4\u03C0\u03B5\u2080) \xB7 (q\u2081q\u2082/r\xB2) and total electric flux through any closed Gaussian surface \u03A6 = \u222E E\xB7dA = q_enclosed / \u03B5\u2080.",
    content: `Coulomb's Law:
The electrostatic force F between two stationary point charges q\u2081 and q\u2082 in vacuum separated by distance r is:
F = (1 / 4\u03C0\u03B5\u2080) \xB7 (|q\u2081 \xB7 q\u2082| / r\xB2)
Where \u03B5\u2080 is the permittivity of free space = 8.854 \xD7 10\u207B\xB9\xB2 C\xB2 N\u207B\xB9 m\u207B\xB2, and 1/(4\u03C0\u03B5\u2080) \u2248 9 \xD7 10\u2079 N m\xB2 C\u207B\xB2.

Gauss's Law in Electrostatics:
The total electric flux \u03A6 through any closed surface is equal to 1/\u03B5\u2080 times the total electric charge q enclosed by that surface:
\u03A6 = \u222E E \xB7 dA = q_enclosed / \u03B5\u2080

Applications of Gauss's Law:
1. Electric field due to an infinitely long straight charged wire: E = \u03BB / (2\u03C0\u03B5\u2080r).
2. Electric field due to an infinite uniformly charged plane sheet: E = \u03C3 / (2\u03B5\u2080).
3. Electric field due to a uniformly charged thin spherical shell: E = 0 inside, E = q / (4\u03C0\u03B5\u2080r\xB2) outside.`
  },
  {
    id: "ncert-phys-12-current-electricity",
    title: "NCERT Class 12 Physics (Part I) - Chapter 3",
    publisher: "NCERT",
    subject: "Physics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 3: Current Electricity",
    section: "Section 3.9 & 3.10 - Kirchhoff's Rules and Wheatstone Bridge",
    pageOrRef: "Pages 115-125 (Official NCERT Class 12 Part I)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["current electricity", "kirchhoffs rules", "junction rule", "loop rule", "wheatstone bridge", "drift velocity", "internal resistance"],
    summary: "Explains Kirchhoff's Junction Rule (conservation of charge, \u03A3I = 0) and Loop Rule (conservation of energy, \u03A3\u0394V = 0), and the balanced condition for a Wheatstone bridge (P/Q = R/S).",
    content: `Kirchhoff's Rules for Electrical Networks:
1. Kirchhoff's First Rule (Junction Rule / KCL):
   - At any junction in an electrical circuit, the sum of currents entering the junction is equal to the sum of currents leaving the junction (Conservation of Charge): \u03A3 I = 0.
2. Kirchhoff's Second Rule (Loop Rule / KVL):
   - The algebraic sum of changes in potential around any closed circuit loop involving resistors and cells in the loop is zero (Conservation of Energy): \u03A3 \u0394V = 0 or \u03A3 E = \u03A3 (I \xB7 R).

Sign Convention:
- Moving in the direction of current across resistor: Potential drops by -I\xB7R.
- Moving opposite to current across resistor: Potential increases by +I\xB7R.
- Moving from negative to positive terminal of cell: Potential changes by +E.

Wheatstone Bridge Balanced Condition:
For four resistors P, Q, R, S connected in a diamond loop with a galvanometer:
When no current flows through galvanometer (I_g = 0), the bridge is balanced:
P / Q = R / S.`
  },
  {
    id: "ncert-phys-12-optics-wave",
    title: "NCERT Class 12 Physics (Part II) - Chapter 10",
    publisher: "NCERT",
    subject: "Physics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 10: Wave Optics",
    section: "Section 10.3 & 10.4 - Huygens Principle & Young's Double Slit Experiment",
    pageOrRef: "Pages 353-366 (Official NCERT Class 12 Part II)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["wave optics", "huygens principle", "wavefront", "interference of light", "youngs double slit", "fringe width", "constructive interference", "destructive interference"],
    summary: "Covers wave nature of light, wavefront construction using Huygens principle, interference of light waves, condition for bright and dark fringes, and fringe width \u03B2 = \u03BBD/d.",
    content: `Young's Double Slit Experiment (YDSE):
Light of wavelength \u03BB passes through two coherent narrow slits separated by distance d, creating an interference pattern on a screen at distance D.

Conditions for Interference:
1. Constructive Interference (Bright Fringes / Maxima):
   - Path difference \u0394x = n \xB7 \u03BB (where n = 0, 1, 2, 3...)
   - Position of n-th bright fringe from center: y_n = (n \xB7 \u03BB \xB7 D) / d.
2. Destructive Interference (Dark Fringes / Minima):
   - Path difference \u0394x = (2n - 1) \xB7 (\u03BB / 2) (where n = 1, 2, 3...)
   - Position of n-th dark fringe from center: y_n' = (2n - 1) \xB7 (\u03BB \xB7 D) / (2d).

Fringe Width (\u03B2):
The distance between any two successive bright fringes or any two successive dark fringes:
\u03B2 = (\u03BB \xB7 D) / d.`
  },
  // ==========================================
  // CLASS 12 NCERT - CHEMISTRY
  // ==========================================
  {
    id: "ncert-chem-12-electrochem",
    title: "NCERT Class 12 Chemistry (Part I) - Chapter 3",
    publisher: "NCERT",
    subject: "Chemistry",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 3: Electrochemistry",
    section: "Section 3.3 - Nernst Equation & Gibbs Energy of Reaction",
    pageOrRef: "Pages 68-78 (Official NCERT Class 12 Part I)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["electrochemistry", "nernst equation", "electrode potential", "emf of cell", "gibbs free energy", "equilibrium constant", "galvanic cell"],
    summary: "Explains dependence of electrode and cell potential on ion concentration via Nernst Equation E_cell = E\xB0_cell - (0.0591/n) \xB7 log Q at 298 K, and relationship \u0394G\xB0 = -n F E\xB0_cell.",
    content: `Nernst Equation:
For a general electrochemical redox reaction:
a A + b B \u2192 c C + d D (involving n moles of electrons transferred)

The cell potential E_cell under non-standard concentrations is:
E_cell = E\xB0_cell - (RT / nF) \xB7 ln( [C]^c [D]^d / [A]^a [B]^b )

At standard temperature T = 298 K (25\xB0C):
E_cell = E\xB0_cell - (0.0591 / n) \xB7 log\u2081\u2080 Q

Where:
- E\xB0_cell = Standard EMF of cell = E\xB0_cathode - E\xB0_anode
- n = Number of electrons transferred in balanced redox equation
- Q = Reaction quotient = [Products] / [Reactants]
- F = Faraday constant \u2248 96485 C mol\u207B\xB9

Thermodynamics of Cell:
\u0394G\xB0 = -n \xB7 F \xB7 E\xB0_cell
log K_c = (n \xB7 E\xB0_cell) / 0.0591`
  },
  {
    id: "ncert-chem-12-organic-haloalkanes",
    title: "NCERT Class 12 Chemistry (Part II) - Chapter 10",
    publisher: "NCERT",
    subject: "Chemistry",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 10: Haloalkanes and Haloarenes",
    section: "Section 10.4 - Nucleophilic Substitution Reactions (SN1 vs SN2)",
    pageOrRef: "Pages 295-306 (Official NCERT Class 12 Part II)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["organic chemistry", "haloalkanes", "nucleophilic substitution", "SN1 reaction", "SN2 reaction", "carbocation", "walden inversion", "racemization"],
    summary: "Compares bimolecular (SN2) and unimolecular (SN1) nucleophilic substitution mechanisms, stereochemical inversion vs racemization, and substrate reactivity order.",
    content: `Nucleophilic Substitution Mechanisms in Haloalkanes (R-X):

1. SN2 Mechanism (Substitution Nucleophilic Bimolecular):
   - Single-step concerted mechanism with a 5-coordinate transition state.
   - Rate Law: Rate = k [R-X] [Nu\u207B] (Second-order kinetics).
   - Stereochemistry: 100% Inversion of configuration (Walden Inversion).
   - Substrate Reactivity Order (Steric Hindrance governs):
     Methyl halide > 1\xB0 (Primary) > 2\xB0 (Secondary) > 3\xB0 (Tertiary).

2. SN1 Mechanism (Substitution Nucleophilic Unimolecular):
   - Two-step mechanism involving carbocation intermediate formation in rate-determining step.
   - Step 1 (Slow): R-X \u2192 R\u207A + X\u207B (Carbocation formation).
   - Step 2 (Fast): R\u207A + Nu\u207B \u2192 R-Nu.
   - Rate Law: Rate = k [R-X] (First-order kinetics).
   - Stereochemistry: Racemization (mixture of retention and inversion due to planar carbocation).
   - Substrate Reactivity Order (Carbocation Stability governs):
     3\xB0 (Tertiary) > 2\xB0 (Secondary) > 1\xB0 (Primary) > Methyl halide.`
  },
  // ==========================================
  // CLASS 12 NCERT - BIOLOGY
  // ==========================================
  {
    id: "ncert-bio-12-genetics-dna",
    title: "NCERT Class 12 Biology - Chapter 6",
    publisher: "NCERT",
    subject: "Biology",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 6: Molecular Basis of Inheritance",
    section: "Section 6.4 & 6.5 - DNA Replication, Transcription & Central Dogma",
    pageOrRef: "Pages 104-118 (Official NCERT Class 12 Biology)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["genetics", "DNA replication", "central dogma", "transcription", "translation", "semiconservative replication", "RNA polymerase", "codons"],
    summary: "Explains Watson-Crick double helix, semiconservative DNA replication (Meselson-Stahl experiment), and transcription of genetic information from DNA to mRNA to proteins.",
    content: `Central Dogma of Molecular Biology (Francis Crick):
DNA \u2500\u2500(Transcription)\u2500\u2500> mRNA \u2500\u2500(Translation)\u2500\u2500> Protein

1. Semiconservative DNA Replication:
   - Demonstrated experimentally by Matthew Meselson and Franklin Stahl (1958) using E. coli and \xB9\u2075N / \xB9\u2074N isotopes.
   - Each daughter DNA molecule retains one parental strand and one newly synthesized strand.
   - DNA-dependent DNA polymerase synthesizes in 5' \u2192 3' direction, creating a leading (continuous) and lagging (Okazaki fragments joined by DNA ligase) strand.

2. Transcription:
   - The process of copying genetic information from one strand of DNA into RNA.
   - Transcription unit contains: Promoter, Structural gene, Terminator.
   - DNA-dependent RNA polymerase binds at promoter and catalyzes polymerization in 5' \u2192 3' direction.
   - In eukaryotes: RNA splicing removes non-coding introns and joins coding exons.`
  },
  {
    id: "ncert-bio-12-biotech-pcr",
    title: "NCERT Class 12 Biology - Chapter 11",
    publisher: "NCERT",
    subject: "Biology",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 11: Biotechnology - Principles and Processes",
    section: "Section 11.2 - Recombinant DNA Technology & PCR",
    pageOrRef: "Pages 197-205 (Official NCERT Class 12 Biology)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["biotechnology", "PCR", "polymerase chain reaction", "restriction enzymes", "DNA ligase", "taq polymerase", "gel electrophoresis", "plasmids"],
    summary: "Covers core tools of recombinant DNA technology including restriction endonucleases (molecular scissors) and in vitro DNA amplification using Polymerase Chain Reaction (PCR).",
    content: `Polymerase Chain Reaction (PCR - Kary Mullis, 1985):
PCR is used to amplify a specific segment of DNA by billion-fold in vitro using 3 cyclic steps:

1. Denaturation:
   - Double-stranded target DNA is heated to high temperature (~94\xB0C) to separate into single strands by breaking hydrogen bonds.
2. Annealing:
   - Temperature is lowered (~50-55\xB0C) to allow two sets of oligonucleotide primers to hybridize/bind to complementary sequences on DNA templates.
3. Extension:
   - Thermostable DNA polymerase (Taq polymerase isolated from bacterium Thermus aquaticus) extends primers using dNTPs at ~72\xB0C.

If process is repeated 30 cycles, approximately 1 billion copies (2\xB3\u2070) of the DNA fragment are synthesized.`
  },
  // ==========================================
  // CLASS 11 NCERT - MATHEMATICS
  // ==========================================
  {
    id: "ncert-math-11-calculus-derivatives",
    title: "NCERT Class 11 Mathematics - Chapter 13",
    publisher: "NCERT",
    subject: "Mathematics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 13: Limits and Derivatives",
    section: "Section 13.5 - First Principle of Differentiation",
    pageOrRef: "Pages 298-312 (Official NCERT Class 11 Mathematics)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["calculus", "derivatives", "limits", "first principle", "differentiation", "slope of tangent", "product rule", "quotient rule"],
    summary: "Introduces the fundamental concept of derivative as the instantaneous rate of change and limit of difference quotient: f'(x) = lim (h\u21920) [f(x+h) - f(x)] / h.",
    content: `Derivative from First Principle:
The derivative of a function f(x) with respect to x at any point x is defined as:
f'(x) = d/dx [f(x)] = lim (h \u2192 0) [ f(x + h) - f(x) ] / h

Standard Derivatives:
- d/dx (x\u207F) = n \xB7 x\u207F\u207B\xB9
- d/dx (sin x) = cos x
- d/dx (cos x) = -sin x
- d/dx (tan x) = sec\xB2 x
- d/dx (e\u02E3) = e\u02E3
- d/dx (ln x) = 1/x

Algebra of Derivatives:
1. Product Rule: d/dx [u \xB7 v] = u \xB7 (dv/dx) + v \xB7 (du/dx)
2. Quotient Rule: d/dx [u / v] = [ v \xB7 (du/dx) - u \xB7 (dv/dx) ] / v\xB2`
  },
  {
    id: "ncert-math-11-trigonometry",
    title: "NCERT Class 11 Mathematics - Chapter 3",
    publisher: "NCERT",
    subject: "Mathematics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 3: Trigonometric Functions",
    section: "Section 3.3 - Trigonometric Functions of Sum and Difference of Two Angles",
    pageOrRef: "Pages 62-75 (Official NCERT Class 11 Mathematics)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["trigonometry", "compound angles", "sin(A+B)", "cos(A+B)", "double angle formulas", "radians", "unit circle"],
    summary: "Derives standard trigonometric identities for sum, difference, and double angles including sin(x+y), cos(x+y), sin 2x = 2 sin x cos x, and cos 2x = cos\xB2x - sin\xB2x.",
    content: `Trigonometric Identities of Compound Angles:
1. Sum and Difference:
   - sin(x + y) = sin x cos y + cos x sin y
   - sin(x - y) = sin x cos y - cos x sin y
   - cos(x + y) = cos x cos y - sin x sin y
   - cos(x - y) = cos x cos y + sin x sin y
   - tan(x + y) = (tan x + tan y) / (1 - tan x tan y)

2. Double Angle Formulas:
   - sin 2x = 2 sin x cos x = (2 tan x) / (1 + tan\xB2 x)
   - cos 2x = cos\xB2 x - sin\xB2 x = 2 cos\xB2 x - 1 = 1 - 2 sin\xB2 x = (1 - tan\xB2 x) / (1 + tan\xB2 x)
   - tan 2x = (2 tan x) / (1 - tan\xB2 x)`
  },
  // ==========================================
  // CLASS 11 NCERT - PHYSICS
  // ==========================================
  {
    id: "ncert-phys-11-kinematics-projectile",
    title: "NCERT Class 11 Physics (Part I) - Chapter 4",
    publisher: "NCERT",
    subject: "Physics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 4: Motion in a Plane",
    section: "Section 4.10 - Projectile Motion",
    pageOrRef: "Pages 77-85 (Official NCERT Class 11 Part I)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["physics", "kinematics", "projectile motion", "time of flight", "maximum height", "horizontal range", "trajectory parabola", "initial velocity"],
    summary: "Analyzes motion of an object projected with velocity u at angle \u03B8 to the horizontal under uniform gravitational acceleration g, resolving into independent horizontal and vertical components.",
    content: `Projectile Motion Formulation:
Initial velocity u is resolved into components:
- Horizontal component: u_x = u cos \u03B8 (constant throughout motion, a_x = 0).
- Vertical component: u_y = u sin \u03B8 (subject to gravity a_y = -g).

Equation of Trajectory:
y = (tan \u03B8) x - [ g / (2 u\xB2 cos\xB2 \u03B8) ] x\xB2 (represents a Parabola).

Key Kinematic Results:
1. Time of Flight (T):
   T = (2 u sin \u03B8) / g
2. Maximum Height Reached (H):
   H = (u\xB2 sin\xB2 \u03B8) / (2g)
3. Horizontal Range (R):
   R = (u\xB2 sin 2\u03B8) / g
   - Maximum range occurs at launch angle \u03B8 = 45\xB0, where R_max = u\xB2 / g.
   - For complementary angles (\u03B8 and 90\xB0 - \u03B8), horizontal range is identical.`
  },
  {
    id: "ncert-phys-11-thermo-first-law",
    title: "NCERT Class 11 Physics (Part II) - Chapter 12",
    publisher: "NCERT",
    subject: "Physics",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 12: Thermodynamics",
    section: "Section 12.5 - First Law of Thermodynamics and Thermodynamic State Variables",
    pageOrRef: "Pages 305-316 (Official NCERT Class 11 Part II)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["physics", "thermodynamics", "first law of thermodynamics", "internal energy", "heat Q", "work done W", "isothermal process", "adiabatic process"],
    summary: "The First Law of Thermodynamics states that heat \u0394Q supplied to a system equals the sum of increase in its internal energy \u0394U and work \u0394W done by the system on its surroundings (\u0394Q = \u0394U + \u0394W).",
    content: `First Law of Thermodynamics (NCERT Convention):
\u0394Q = \u0394U + \u0394W
Where:
- \u0394Q = Heat supplied to the system by surroundings (+ve if heat added, -ve if heat released).
- \u0394U = Change in internal energy (for an ideal gas, U depends only on temperature T: \u0394U = n C_v \u0394T).
- \u0394W = Work done by the system on surroundings = P \xB7 \u0394V (+ve for expansion, -ve for compression).

Application to Thermodynamic Processes:
1. Isothermal Process (Constant Temperature T = const, \u0394T = 0):
   - Internal energy change \u0394U = 0 => \u0394Q = \u0394W = nRT ln(V\u2082 / V\u2081).
2. Isochoric Process (Constant Volume V = const, \u0394V = 0):
   - Work done \u0394W = 0 => \u0394Q = \u0394U = n C_v \u0394T.
3. Isobaric Process (Constant Pressure P = const):
   - \u0394W = P (V\u2082 - V\u2081) => \u0394Q = n C_p \u0394T.
4. Adiabatic Process (No heat exchange \u0394Q = 0):
   - \u0394U = -\u0394W => Work done by gas decreases its internal energy and temperature.`
  },
  // ==========================================
  // CLASS 11 NCERT - CHEMISTRY
  // ==========================================
  {
    id: "ncert-chem-11-stoichiometry-mole",
    title: "NCERT Class 11 Chemistry (Part I) - Chapter 1",
    publisher: "NCERT",
    subject: "Chemistry",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 1: Some Basic Concepts of Chemistry",
    section: "Section 1.8 & 1.9 - Mole Concept, Molar Mass and Limiting Reagent",
    pageOrRef: "Pages 16-24 (Official NCERT Class 11 Part I)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["chemistry", "mole concept", "avogadro number", "molar mass", "stoichiometry", "limiting reagent", "empirical formula", "percentage composition"],
    summary: "Defines 1 mole as containing 6.022 \xD7 10\xB2\xB3 elementary entities (Avogadro Constant N_A) and calculates stoichiometric product yields determined by the limiting reagent.",
    content: `Mole Concept and Stoichiometric Calculations:
1. Mole Definition:
   - One mole is the amount of substance that contains 6.022 \xD7 10\xB2\xB3 particles (atoms, molecules, or ions).
   - Number of Moles (n) = Given Mass (m) / Molar Mass (M) = Number of particles / N_A.

2. Stoichiometric Calculations in Chemical Equations:
   - Example: N\u2082(g) + 3 H\u2082(g) \u2192 2 NH\u2083(g)
   - 1 mole of N\u2082 reacts with 3 moles of H\u2082 to produce 2 moles of NH\u2083.

3. Limiting Reagent (LR):
   - The reactant which gets completely consumed first in a reaction is called the Limiting Reagent. It limits the maximum amount of product that can be formed.
   - Identification Rule: Divide moles of each reactant by its stoichiometric coefficient in the balanced equation. The reactant with the lowest ratio is the Limiting Reagent.`
  },
  {
    id: "ncert-chem-11-chemical-bonding",
    title: "NCERT Class 11 Chemistry (Part I) - Chapter 4",
    publisher: "NCERT",
    subject: "Chemistry",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 4: Chemical Bonding and Molecular Structure",
    section: "Section 4.3 & 4.6 - VSEPR Theory and Hybridization (sp, sp\xB2, sp\xB3)",
    pageOrRef: "Pages 101-118 (Official NCERT Class 11 Part I)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["chemistry", "chemical bonding", "vsepr theory", "hybridization", "sp3 hybridization", "lone pair repulsion", "molecular geometry", "bond angle"],
    summary: "Predicts 3D shapes of covalent molecules using Valence Shell Electron Pair Repulsion (VSEPR) theory and atomic orbital hybridization concepts (sp, sp\xB2, sp\xB3, sp\xB3d).",
    content: `VSEPR Theory and Orbital Hybridization:
1. VSEPR Theory Postulates (Gillespie & Nyholm):
   - Electron pairs in the valence shell repel one another and stay as far apart as possible to minimize repulsion.
   - Order of repulsive forces: Lone Pair - Lone Pair (lp-lp) > Lone Pair - Bond Pair (lp-bp) > Bond Pair - Bond Pair (bp-bp).

2. Molecular Geometries and Hybridization:
   - sp (Steric number 2): Linear geometry, 180\xB0 bond angle (e.g. BeCl\u2082, C\u2082H\u2082).
   - sp\xB2 (Steric number 3): Trigonal planar, 120\xB0 bond angle (e.g. BF\u2083, C\u2082H\u2084).
   - sp\xB3 (Steric number 4):
     * 4 bond pairs, 0 lone pairs: Regular Tetrahedral, 109.5\xB0 (e.g. CH\u2084).
     * 3 bond pairs, 1 lone pair: Trigonal Pyramidal, 107\xB0 (e.g. NH\u2083 - lone pair compresses angle).
     * 2 bond pairs, 2 lone pairs: Bent / V-shaped, 104.5\xB0 (e.g. H\u2082O).`
  },
  // ==========================================
  // CLASS 11 NCERT - BIOLOGY
  // ==========================================
  {
    id: "ncert-bio-11-cell-unit-life",
    title: "NCERT Class 11 Biology - Chapter 8",
    publisher: "NCERT",
    subject: "Biology",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 8: Cell - The Unit of Life",
    section: "Section 8.5 - Eukaryotic Cell Organelles (Mitochondria, Chloroplasts, ER, Golgi)",
    pageOrRef: "Pages 128-142 (Official NCERT Class 11 Biology)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["biology", "cell biology", "mitochondria", "chloroplast", "endoplasmic reticulum", "golgi apparatus", "fluid mosaic model", "plasma membrane"],
    summary: "Explains fluid mosaic model of plasma membrane (Singer & Nicolson) and endomembrane system organelles including ATP synthesis in mitochondria and photosynthetic thylakoids in chloroplasts.",
    content: `Eukaryotic Cell Structure & Organelles:
1. Plasma Membrane (Fluid Mosaic Model - Singer and Nicolson, 1972):
   - Phospholipid bilayer with polar hydrophilic heads facing outward and non-polar hydrophobic fatty acid tails facing inward.
   - Quasi-fluid nature of lipids enables lateral movement of integral and peripheral proteins within the bilayer.

2. Mitochondria (Powerhouse of the Cell):
   - Double membrane-bound organelle. Inner membrane folded into cristae to increase surface area for ATP synthase (F\u2080-F\u2081 particles).
   - Site of aerobic respiration and cellular ATP production via Krebs cycle and electron transport chain. Contains circular DNA and 70S ribosomes.

3. Chloroplasts:
   - Double membrane organelle containing stroma and membrane sacs called thylakoids arranged in stacks called grana. Thylakoid membranes harbor chlorophyll for light absorption.`
  },
  {
    id: "ncert-bio-11-plant-photosynthesis",
    title: "NCERT Class 11 Biology - Chapter 13",
    publisher: "NCERT",
    subject: "Biology",
    gradeLevel: "Grade 11-12",
    chapter: "Chapter 13: Photosynthesis in Higher Plants",
    section: "Section 13.6 & 13.7 - Light Reaction, Z-Scheme and Calvin Cycle (C3 pathway)",
    pageOrRef: "Pages 208-220 (Official NCERT Class 11 Biology)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["biology", "photosynthesis", "light reaction", "z scheme", "calvin cycle", "c3 cycle", "rubisco", "atp nadph", "photolysis of water"],
    summary: "Explains photochemical light reaction with non-cyclic photophosphorylation (Z-scheme) and dark reaction Calvin C3 cycle driven by enzyme RuBisCO in the stroma.",
    content: `Photosynthesis in Higher Plants:
1. Light Reactions (Photochemical Phase):
   - Occur in thylakoid membranes.
   - Photosystem II (P680) absorbs light at 680 nm, causing photolysis of water: 2 H\u2082O \u2192 4 H\u207A + O\u2082 + 4 e\u207B.
   - Electrons pass along electron transport chain to Photosystem I (P700) creating proton gradient across thylakoid membrane to synthesize ATP and NADPH (Z-Scheme).

2. Calvin Cycle (C3 Pathway / Dark Reaction in Stroma):
   - Step 1: Carboxylation: CO\u2082 combines with Ribulose-1,5-bisphosphate (RuBP) catalyzed by RuBisCO to form 2 molecules of 3-Phosphoglyceric acid (3-PGA).
   - Step 2: Reduction: 3-PGA is reduced using 2 ATP and 2 NADPH per CO\u2082 fixed to form Triose phosphate (Glucose precursor).
   - Step 3: Regeneration: Regeneration of RuBP requires 1 ATP.
   - Net balance: For synthesis of 1 glucose molecule (C\u2086H\u2081\u2082O\u2086), 6 turns of Calvin cycle consume 6 CO\u2082, 18 ATP, and 12 NADPH.`
  },
  // ==========================================
  // CLASS 9 & 10 NCERT - SCIENCE & MATH
  // ==========================================
  {
    id: "ncert-math-9-linear-eq",
    title: "NCERT Class 9 Mathematics - Chapter 4",
    publisher: "NCERT",
    subject: "Mathematics",
    gradeLevel: "Grade 9-10",
    chapter: "Chapter 4: Linear Equations in Two Variables",
    section: "Section 4.2 - General Form and Graphical Solutions",
    pageOrRef: "Pages 67-72 (Official NCERT Class 9 Mathematics)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
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
    id: "ncert-phys-9-newton-laws",
    title: "NCERT Class 9 Science - Chapter 9",
    publisher: "NCERT",
    subject: "Physics",
    gradeLevel: "Grade 9-10",
    chapter: "Chapter 9: Force and Laws of Motion",
    section: "Section 9.3 - Newton's Second Law of Motion and Momentum",
    pageOrRef: "Pages 118-124 (Official NCERT Class 9 Science)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["physics", "newton laws of motion", "force", "momentum", "acceleration", "F=ma", "inertia", "impulse"],
    summary: "Newton's Second Law states that the rate of change of momentum is proportional to the applied unbalanced force in the direction of force (F = m \xD7 a).",
    content: `Newton's Laws of Motion:
1. First Law (Inertia): An object remains at rest or uniform motion unless acted upon by an external unbalanced force.
2. Second Law: The rate of change of momentum of an object is proportional to the applied force in the direction of force.
   - Momentum p = m \xB7 v.
   - Force F = \u0394p / \u0394t = m(v - u) / t = m \xB7 a (Force in Newtons, mass in kg, acceleration in m/s\xB2).
3. Third Law: To every action, there is an equal and opposite reaction.`
  },
  {
    id: "ncert-chem-10-acids-bases",
    title: "NCERT Class 10 Science - Chapter 2",
    publisher: "NCERT",
    subject: "Chemistry",
    gradeLevel: "Grade 9-10",
    chapter: "Chapter 2: Acids, Bases and Salts",
    section: "Section 2.3 - The pH Scale and Neutralization",
    pageOrRef: "Pages 24-30 (Official NCERT Class 10 Science)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["chemistry", "acids", "bases", "pH scale", "neutralization", "hydrogen ions H+", "hydroxide ions OH-", "salts"],
    summary: "Measures hydrogen ion concentration [H\u207A] on pH scale from 0 to 14. Neutralization reaction: Acid + Base \u2192 Salt + Water.",
    content: `Acids produce H\u207A ions in aqueous solution. Bases produce OH\u207B ions in aqueous solution.
pH Scale:
- Measures [H\u207A] concentration. pH = -log\u2081\u2080[H\u207A].
- pH = 7: Neutral solution.
- pH < 7: Acidic solution (lower value = stronger acid).
- pH > 7: Basic solution (higher value = stronger base).
Neutralization Reaction: HCl + NaOH \u2192 NaCl + H\u2082O.`
  },
  {
    id: "ncert-bio-10-life-processes",
    title: "NCERT Class 10 Science - Chapter 6",
    publisher: "NCERT",
    subject: "Biology",
    gradeLevel: "Grade 9-10",
    chapter: "Chapter 6: Life Processes",
    section: "Section 6.2 - Autotrophic Nutrition & Photosynthesis",
    pageOrRef: "Pages 94-98 (Official NCERT Class 10 Science)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["biology", "photosynthesis", "chlorophyll", "stomata", "glucose", "light reaction", "guard cells"],
    summary: "Explains photosynthesis equation 6 CO\u2082 + 12 H\u2082O + light + chlorophyll \u2192 C\u2086H\u2081\u2082O\u2086 + 6 O\u2082 + 6 H\u2082O and stomatal gas exchange regulation.",
    content: `Photosynthesis Equation:
6 CO\u2082 + 12 H\u2082O + Sunlight + Chlorophyll \u2192 C\u2086H\u2081\u2082O\u2086 (Glucose) + 6 O\u2082 + 6 H\u2082O
Key Events:
1. Absorption of light by chlorophyll.
2. Photolysis of water: Splitting water into hydrogen and oxygen.
3. Reduction of carbon dioxide to carbohydrates.`
  },
  // ==========================================
  // CLASS 6 - 8 NCERT - FOUNDATIONS
  // ==========================================
  {
    id: "ncert-math-7-fractions",
    title: "NCERT Class 7 Mathematics - Chapter 2",
    publisher: "NCERT",
    subject: "Mathematics",
    gradeLevel: "Grade 6-8",
    chapter: "Chapter 2: Fractions and Decimals",
    section: "Section 2.2 - Addition and Subtraction of Unlike Fractions",
    pageOrRef: "Pages 28-34 (Official NCERT Class 7 Mathematics)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
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
    id: "ncert-math-8-mensuration",
    title: "NCERT Class 8 Mathematics - Chapter 11",
    publisher: "NCERT",
    subject: "Mathematics",
    gradeLevel: "Grade 6-8",
    chapter: "Chapter 11: Mensuration",
    section: "Section 11.4 - Area of Trapezium, Surface Area and Volume",
    pageOrRef: "Pages 170-178 (Official NCERT Class 8 Mathematics)",
    license: "CC BY-NC-SA 4.0 / NCERT Open National Curriculum",
    keyConcepts: ["mathematics", "mensuration", "area of trapezium", "surface area cylinder", "volume cuboid", "geometric formulas"],
    summary: "Standard geometric formulas for 2D and 3D shapes: Area of Trapezium = 1/2(a+b)h, Volume of cylinder = \u03C0r\xB2h, Total surface area = 2\u03C0r(r+h).",
    content: `Mensuration Formulas:
- Area of Trapezium = 1/2 \xD7 (Sum of parallel sides) \xD7 height = 1/2 \xB7 (a + b) \xB7 h.
- Cuboid: Surface Area = 2(lb + bh + hl), Volume = l \xB7 b \xB7 h.
- Cylinder: Curved Surface Area = 2\u03C0rh, Total Surface Area = 2\u03C0r(r + h), Volume = \u03C0r\xB2h.`
  }
];
export {
  OER_CORPUS,
  SUPPORTED_LANGUAGES
};
