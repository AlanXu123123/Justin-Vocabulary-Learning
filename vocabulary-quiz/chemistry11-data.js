// Chemistry 11 learning data aligned to BC Chemistry 11 topics.
// English definitions are concise, open-textbook style explanations for ELL preview.
(function () {
  function term(term, phonetic, definitionEn, definitionCn, priority, sourceNote) {
    return {
      term: term,
      phonetic: phonetic,
      definitionEn: definitionEn,
      definitionCn: definitionCn,
      priority: priority || 'core',
      source: 'BC Chemistry 11 aligned; OpenStax/LibreTexts style definition',
      sourceNote: sourceNote || ''
    };
  }

  function q(id, unitId, question, options, answerIndex, explanation, tags, difficulty) {
    return { id: id, unitId: unitId, type: 'multiple-choice', question: question, options: options, correctIndex: answerIndex, explanation: explanation, conceptTags: tags || [], difficulty: difficulty || 'core' };
  }

  var units = [
    {
      id: 'scientific-skills',
      name: 'Scientific Skills & Measurement',
      bigIdea: 'Chemistry uses precise measurement, evidence, and mathematical reasoning.',
      terms: [
        term('scientific method', '/ˌsaɪənˈtɪfɪk ˈmeθəd/', 'A systematic process for asking questions, testing hypotheses, collecting evidence, and drawing conclusions.', '科学方法；提出问题、假设、实验、收集证据并得出结论的系统过程。', 'support'),
        term('hypothesis', '/haɪˈpɑːθəsɪs/', 'A testable explanation or prediction based on observations.', '假设；基于观察提出、可用实验检验的解释或预测。', 'support'),
        term('variable', '/ˈveriəbəl/', 'A factor in an experiment that can change or be measured.', '变量；实验中可能改变或被测量的因素。', 'support'),
        term('independent variable', '/ˌɪndɪˈpendənt ˈveriəbəl/', 'The variable that is intentionally changed in an experiment.', '自变量；实验中被主动改变的变量。', 'support'),
        term('dependent variable', '/dɪˌpendənt ˈveriəbəl/', 'The variable that is measured in response to a change.', '因变量；随自变量变化而被测量的结果。', 'support'),
        term('accuracy', '/ˈækjərəsi/', 'How close a measurement is to the accepted or true value.', '准确度；测量值接近真实值或公认值的程度。', 'core'),
        term('precision', '/prɪˈsɪʒən/', 'How close repeated measurements are to one another.', '精密度；多次测量结果彼此接近的程度。', 'core'),
        term('uncertainty', '/ʌnˈsɜːrtnti/', 'The range of possible error in a measured value.', '不确定度；测量值可能存在误差的范围。', 'core'),
        term('significant figures', '/sɪɡˌnɪfɪkənt ˈfɪɡjərz/', 'Digits in a measured number that show its precision.', '有效数字；表示测量精确程度的数字。', 'core'),
        term('scientific notation', '/ˌsaɪənˈtɪfɪk noʊˈteɪʃən/', 'A way to write very large or very small numbers using powers of ten.', '科学记数法；用 10 的幂表示很大或很小数字的方法。', 'core'),
        term('dimensional analysis', '/daɪˌmenʃənəl əˈnæləsɪs/', 'A problem-solving method that uses units and conversion factors.', '量纲分析；利用单位和换算因子解决计算问题的方法。', 'core'),
        term('conversion factor', '/kənˈvɜːrʒən ˈfæktər/', 'A ratio of equal quantities used to convert from one unit to another.', '换算因子；表示两个等量单位关系、用于单位转换的比例。', 'core')
      ]
    },
    {
      id: 'matter-classification',
      name: 'Matter & Classification',
      bigIdea: 'Matter can be classified by composition and by physical and chemical properties.',
      terms: [
        term('matter', '/ˈmætər/', 'Anything that has mass and occupies space.', '物质；有质量并占据空间的任何东西。', 'core'),
        term('substance', '/ˈsʌbstəns/', 'Matter with a fixed composition and distinct properties.', '纯物质；组成固定并具有特定性质的物质。', 'core'),
        term('mixture', '/ˈmɪkstʃər/', 'A physical combination of two or more substances.', '混合物；两种或多种物质的物理组合。', 'core'),
        term('homogeneous mixture', '/ˌhoʊməˈdʒiːniəs ˈmɪkstʃər/', 'A mixture with uniform composition throughout.', '均匀混合物；各部分组成一致的混合物。', 'core'),
        term('heterogeneous mixture', '/ˌhetərəˈdʒiːniəs ˈmɪkstʃər/', 'A mixture whose composition is not uniform throughout.', '非均匀混合物；不同部分组成不完全相同的混合物。', 'core'),
        term('element', '/ˈelɪmənt/', 'A pure substance made of only one kind of atom.', '元素；只由一种原子组成的纯物质。', 'core'),
        term('compound', '/ˈkɑːmpaʊnd/', 'A pure substance made of two or more elements chemically combined.', '化合物；由两种或多种元素化学结合形成的纯物质。', 'core'),
        term('physical property', '/ˈfɪzɪkəl ˈprɑːpərti/', 'A property observed without changing a substance into a new substance.', '物理性质；不产生新物质即可观察的性质。', 'important'),
        term('chemical property', '/ˈkemɪkəl ˈprɑːpərti/', 'A property describing how a substance can form new substances.', '化学性质；描述物质发生化学变化能力的性质。', 'important'),
        term('physical change', '/ˈfɪzɪkəl tʃeɪndʒ/', 'A change that affects form or state but not chemical composition.', '物理变化；改变形态或状态但不改变化学组成的变化。', 'core'),
        term('chemical change', '/ˈkemɪkəl tʃeɪndʒ/', 'A change in which one or more new substances form.', '化学变化；产生一种或多种新物质的变化。', 'core'),
        term('density', '/ˈdensəti/', 'Mass per unit volume of a substance.', '密度；单位体积的质量。', 'important')
      ]
    },
    {
      id: 'atomic-structure',
      name: 'Atomic Structure',
      bigIdea: 'Atoms and molecules are the building blocks of matter.',
      terms: [
        term('atom', '/ˈætəm/', 'The smallest unit of an element that retains the properties of that element.', '原子；保持元素性质的最小单位。', 'core'),
        term('proton', '/ˈproʊtɑːn/', 'A positively charged particle in the nucleus of an atom.', '质子；位于原子核内、带正电的粒子。', 'core'),
        term('neutron', '/ˈnuːtrɑːn/', 'A neutral particle in the nucleus of an atom.', '中子；位于原子核内、不带电的粒子。', 'core'),
        term('electron', '/ɪˈlektrɑːn/', 'A negatively charged particle found outside the nucleus.', '电子；位于原子核外、带负电的粒子。', 'core'),
        term('nucleus', '/ˈnuːkliəs/', 'The small, dense centre of an atom containing protons and neutrons.', '原子核；含质子和中子的原子中心致密区域。', 'core'),
        term('atomic number', '/əˈtɑːmɪk ˈnʌmbər/', 'The number of protons in the nucleus of an atom.', '原子序数；原子核中的质子数。', 'core'),
        term('mass number', '/mæs ˈnʌmbər/', 'The total number of protons and neutrons in an atom.', '质量数；质子数与中子数之和。', 'core'),
        term('isotope', '/ˈaɪsətoʊp/', 'Atoms of the same element that have different numbers of neutrons.', '同位素；质子数相同但中子数不同的同种元素原子。', 'core'),
        term('ion', '/ˈaɪən/', 'An atom or group of atoms with an electric charge.', '离子；带电的原子或原子团。', 'core'),
        term('cation', '/ˈkætaɪən/', 'A positively charged ion.', '阳离子；带正电的离子。', 'core'),
        term('anion', '/ˈænaɪən/', 'A negatively charged ion.', '阴离子；带负电的离子。', 'core'),
        term('electron configuration', '/ɪˈlektrɑːn kənˌfɪɡjəˈreɪʃən/', 'The arrangement of electrons in the energy levels and orbitals of an atom.', '电子排布；电子在能级和轨道中的排列方式。', 'core'),
        term('valence electron', '/ˈveɪləns ɪˈlektrɑːn/', 'An electron in the outermost occupied energy level of an atom.', '价电子；原子最外层能级中的电子，通常参与成键。', 'core'),
        term('orbital', '/ˈɔːrbɪtəl/', 'A region around the nucleus where an electron is likely to be found.', '轨道；电子最可能出现的原子核周围区域。', 'important')
      ]
    },
    {
      id: 'periodic-trends',
      name: 'Periodic Table & Trends',
      bigIdea: 'The periodic table organizes elements and reveals patterns in their properties.',
      terms: [
        term('periodic table', '/ˌpɪriˈɑːdɪk ˈteɪbəl/', 'A table that organizes elements by atomic number and repeating properties.', '元素周期表；按原子序数和周期性性质排列元素的表。', 'core'),
        term('period', '/ˈpɪriəd/', 'A horizontal row in the periodic table.', '周期；元素周期表中的横行。', 'core'),
        term('group', '/ɡruːp/', 'A vertical column in the periodic table.', '族；元素周期表中的纵列。', 'core'),
        term('metal', '/ˈmetəl/', 'An element that is usually shiny, malleable, and a good conductor.', '金属；通常有光泽、可延展且导电性好的元素。', 'core'),
        term('non-metal', '/ˌnɑːn ˈmetəl/', 'An element that generally lacks metallic properties.', '非金属；通常不具备金属性质的元素。', 'core'),
        term('metalloid', '/ˈmetəlɔɪd/', 'An element with properties between metals and non-metals.', '类金属；性质介于金属和非金属之间的元素。', 'important'),
        term('alkali metal', '/ˈælkəlaɪ ˈmetəl/', 'A highly reactive Group 1 metal.', '碱金属；第 1 族高反应性金属。', 'important'),
        term('halogen', '/ˈhælədʒən/', 'A reactive non-metal in Group 17.', '卤素；第 17 族活泼非金属。', 'important'),
        term('noble gas', '/ˈnoʊbəl ɡæs/', 'A Group 18 element that is generally very unreactive.', '稀有气体；第 18 族通常很稳定、不活泼的元素。', 'important'),
        term('atomic radius', '/əˈtɑːmɪk ˈreɪdiəs/', 'A measure of the size of an atom.', '原子半径；原子大小的度量。', 'core'),
        term('ionization energy', '/ˌaɪənəˈzeɪʃən ˈenərdʒi/', 'The energy required to remove an electron from an atom or ion.', '电离能；从原子或离子移走一个电子所需的能量。', 'core'),
        term('electronegativity', '/ɪˌlektrəˌneɡəˈtɪvəti/', 'The ability of an atom to attract shared electrons in a chemical bond.', '电负性；原子吸引成键共享电子的能力。', 'core'),
        term('shielding effect', '/ˈʃiːldɪŋ ɪˈfekt/', 'The reduction of nuclear attraction caused by inner electrons.', '屏蔽效应；内层电子削弱原子核对外层电子吸引的作用。', 'important')
      ]
    },
    {
      id: 'bonding-geometry',
      name: 'Chemical Bonding & Molecular Geometry',
      bigIdea: 'Chemical bonds and molecular shape influence the properties of substances.',
      terms: [
        term('chemical bond', '/ˈkemɪkəl bɑːnd/', 'An attraction that holds atoms or ions together.', '化学键；把原子或离子结合在一起的吸引力。', 'core'),
        term('ionic bond', '/aɪˈɑːnɪk bɑːnd/', 'An attraction between oppositely charged ions.', '离子键；正负离子之间的静电吸引。', 'core'),
        term('covalent bond', '/koʊˈveɪlənt bɑːnd/', 'A chemical bond formed when atoms share electrons.', '共价键；原子共享电子形成的化学键。', 'core'),
        term('polar covalent bond', '/ˈpoʊlər koʊˈveɪlənt bɑːnd/', 'A covalent bond in which electrons are shared unequally.', '极性共价键；电子共享不均的共价键。', 'core'),
        term('Lewis structure', '/ˈluːɪs ˈstrʌktʃər/', 'A diagram that shows valence electrons and bonds in a molecule or ion.', '路易斯结构；显示价电子和化学键的图示。', 'core'),
        term('lone pair', '/loʊn per/', 'A pair of valence electrons not shared in a bond.', '孤对电子；未参与成键的一对价电子。', 'core'),
        term('octet rule', '/ɑːkˈtet ruːl/', 'The tendency of atoms to have eight valence electrons.', '八隅体规则；原子倾向于拥有 8 个价电子的规律。', 'core'),
        term('VSEPR theory', '/ˈvespər ˈθɪri/', 'A model that predicts molecular shape from repulsions between electron groups.', '价层电子对互斥理论；根据电子群排斥预测分子形状的模型。', 'core'),
        term('molecular geometry', '/məˈlekjələr dʒiˈɑːmətri/', 'The three-dimensional arrangement of atoms in a molecule.', '分子几何构型；分子中原子的三维排列。', 'core'),
        term('linear', '/ˈlɪniər/', 'A molecular shape with atoms arranged in a straight line.', '直线形；原子排列成直线的分子形状。', 'important'),
        term('trigonal planar', '/ˈtrɪɡənəl ˈpleɪnər/', 'A molecular shape with three groups arranged in one plane around a central atom.', '三角平面形；三个电子群围绕中心原子在同一平面排列。', 'important'),
        term('tetrahedral', '/ˌtetrəˈhiːdrəl/', 'A molecular shape with four groups arranged around a central atom.', '四面体形；四个电子群围绕中心原子排列的形状。', 'important'),
        term('intermolecular force', '/ˌɪntərməˈlekjələr fɔːrs/', 'An attraction between separate molecules.', '分子间作用力；不同分子之间的吸引力。', 'core'),
        term('hydrogen bond', '/ˈhaɪdrədʒən bɑːnd/', 'A strong intermolecular attraction involving hydrogen bonded to N, O, or F.', '氢键；涉及与 N、O 或 F 相连氢原子的较强分子间作用力。', 'core')
      ]
    },
    {
      id: 'names-formulae',
      name: 'Chemical Names & Formulae',
      bigIdea: 'Names and formulae communicate the composition of compounds.',
      terms: [
        term('chemical formula', '/ˈkemɪkəl ˈfɔːrmjələ/', 'A symbolic representation of the elements and ratios in a substance.', '化学式；用元素符号和数字表示物质组成和比例。', 'core'),
        term('molecular formula', '/məˈlekjələr ˈfɔːrmjələ/', 'A formula that shows the actual number of atoms in a molecule.', '分子式；表示一个分子中各原子实际数量的化学式。', 'core'),
        term('empirical formula', '/ɪmˈpɪrɪkəl ˈfɔːrmjələ/', 'A formula showing the simplest whole-number ratio of atoms.', '实验式；表示原子最简整数比的化学式。', 'important'),
        term('ionic compound', '/aɪˈɑːnɪk ˈkɑːmpaʊnd/', 'A compound made of positive and negative ions.', '离子化合物；由阳离子和阴离子组成的化合物。', 'core'),
        term('molecular compound', '/məˈlekjələr ˈkɑːmpaʊnd/', 'A compound made of molecules formed by covalent bonds.', '分子化合物；由共价键形成分子的化合物。', 'core'),
        term('polyatomic ion', '/ˌpɑːliəˈtɑːmɪk ˈaɪən/', 'A charged group of two or more covalently bonded atoms.', '多原子离子；由两个或多个共价结合原子组成的带电粒子。', 'core'),
        term('subscript', '/ˈsʌbskrɪpt/', 'A small number in a formula that shows how many atoms or ions are present.', '下标；化学式中表示原子或离子数量的小数字。', 'core'),
        term('coefficient', '/ˌkoʊɪˈfɪʃənt/', 'A number placed before a formula in a chemical equation.', '系数；化学方程式中写在化学式前表示数量的数字。', 'core'),
        term('nomenclature', '/ˈnoʊmənkleɪtʃər/', 'A system of rules for naming chemical substances.', '命名法；给化学物质命名的一套规则。', 'important'),
        term('multivalent metal', '/ˌmʌltiˈveɪlənt ˈmetəl/', 'A metal that can form ions with more than one possible charge.', '多价金属；能形成多种电荷离子的金属。', 'important'),
        term('Roman numeral', '/ˈroʊmən ˈnuːmərəl/', 'A numeral used in compound names to show the charge of a multivalent metal.', '罗马数字；化合物命名中表示多价金属电荷的数字。', 'important'),
        term('acid', '/ˈæsɪd/', 'A substance that produces hydrogen ions in water or donates protons.', '酸；在水中产生氢离子或提供质子的物质。', 'core')
      ]
    },
    {
      id: 'mole-concept',
      name: 'Mole Concept',
      bigIdea: 'The mole makes atoms and molecules measurable.',
      terms: [
        term('mole', '/moʊl/', 'The SI unit for amount of substance; one mole contains 6.022 × 10^23 particles.', '摩尔；物质的量单位，1 摩尔含 6.022×10^23 个粒子。', 'core'),
        term("Avogadro's number", '/ˌævəˈɡɑːdroʊz ˈnʌmbər/', 'The number of particles in one mole, 6.022 × 10^23.', '阿伏伽德罗常数；1 摩尔中的粒子数，6.022×10^23。', 'core'),
        term('particle', '/ˈpɑːrtɪkəl/', 'A small unit of matter such as an atom, molecule, or ion.', '粒子；原子、分子或离子等微小物质单位。', 'core'),
        term('molar mass', '/ˈmoʊlər mæs/', 'The mass of one mole of a substance.', '摩尔质量；1 摩尔物质的质量。', 'core'),
        term('formula mass', '/ˈfɔːrmjələ mæs/', 'The sum of the atomic masses in a chemical formula.', '式量；化学式中所有原子相对原子质量的总和。', 'important'),
        term('percent composition', '/pərˈsent ˌkɑːmpəˈzɪʃən/', 'The percent by mass of each element in a compound.', '百分组成；化合物中各元素所占质量百分比。', 'core'),
        term('mole ratio', '/moʊl ˈreɪʃioʊ/', 'A ratio between amounts in moles from a balanced chemical equation.', '摩尔比；由配平方程式得到的物质摩尔数量比例。', 'core'),
        term('molar volume', '/ˈmoʊlər ˈvɑːljuːm/', 'The volume occupied by one mole of gas under specified conditions.', '摩尔体积；一定条件下 1 摩尔气体所占体积。', 'important'),
        term('STP', '/ˌes tiː ˈpiː/', 'Standard temperature and pressure, commonly 0°C and 1 atm.', '标准状况；通常指 0°C 和 1 atm。', 'important'),
        term('mass-to-mole conversion', '/mæs tə moʊl kənˈvɜːrʒən/', 'A calculation that changes mass into moles using molar mass.', '质量到摩尔换算；用摩尔质量把质量换算成摩尔数。', 'core'),
        term('mole-to-particle conversion', '/moʊl tə ˈpɑːrtɪkəl kənˈvɜːrʒən/', 'A calculation that changes moles into particles using Avogadro’s number.', '摩尔到粒子数换算；用阿伏伽德罗常数把摩尔数换算成粒子数。', 'core')
      ]
    },
    {
      id: 'chemical-reactions',
      name: 'Chemical Reactions',
      bigIdea: 'Matter and energy are conserved in chemical reactions.',
      terms: [
        term('chemical reaction', '/ˈkemɪkəl riˈækʃən/', 'A process in which substances are converted into new substances.', '化学反应；物质转化为新物质的过程。', 'core'),
        term('reactant', '/riˈæktənt/', 'A starting substance in a chemical reaction.', '反应物；化学反应开始时参与反应的物质。', 'core'),
        term('product', '/ˈprɑːdʌkt/', 'A substance formed in a chemical reaction.', '生成物；化学反应后形成的物质。', 'core'),
        term('chemical equation', '/ˈkemɪkəl ɪˈkweɪʒən/', 'A symbolic representation of a chemical reaction.', '化学方程式；用化学式表示化学反应的式子。', 'core'),
        term('balanced equation', '/ˈbælənst ɪˈkweɪʒən/', 'A chemical equation with equal numbers of each type of atom on both sides.', '配平方程式；反应式两边各元素原子数相等的化学方程式。', 'core'),
        term('law of conservation of mass', '/lɔː əv ˌkɑːnsərˈveɪʃən əv mæs/', 'Matter is not created or destroyed in a chemical reaction.', '质量守恒定律；化学反应中物质既不凭空产生也不消失。', 'core'),
        term('synthesis reaction', '/ˈsɪnθəsɪs riˈækʃən/', 'A reaction in which simpler substances combine to form a more complex substance.', '合成反应；较简单物质结合生成较复杂物质的反应。', 'core'),
        term('decomposition reaction', '/ˌdiːkɑːmpəˈzɪʃən riˈækʃən/', 'A reaction in which one substance breaks down into simpler substances.', '分解反应；一种物质分解成较简单物质的反应。', 'core'),
        term('single replacement reaction', '/ˈsɪŋɡəl rɪˈpleɪsmənt riˈækʃən/', 'A reaction in which one element replaces another in a compound.', '单置换反应；一种元素取代化合物中另一种元素的反应。', 'core'),
        term('double replacement reaction', '/ˈdʌbəl rɪˈpleɪsmənt riˈækʃən/', 'A reaction in which ions in two compounds exchange partners.', '双置换反应；两个化合物中的离子互换的反应。', 'core'),
        term('combustion reaction', '/kəmˈbʌstʃən riˈækʃən/', 'A reaction with oxygen that releases energy, often producing oxides.', '燃烧反应；物质与氧气反应并释放能量的反应。', 'core'),
        term('precipitation reaction', '/prɪˌsɪpɪˈteɪʃən riˈækʃən/', 'A reaction in solution that forms an insoluble solid.', '沉淀反应；溶液中生成不溶性固体的反应。', 'important')
      ]
    },
    {
      id: 'stoichiometry',
      name: 'Stoichiometry',
      bigIdea: 'Balanced equations allow quantitative prediction of reactants and products.',
      terms: [
        term('stoichiometry', '/ˌstɔɪkiˈɑːmətri/', 'The calculation of quantities of reactants and products in a chemical reaction.', '化学计量；根据化学方程式计算反应物和生成物数量。', 'core'),
        term('theoretical yield', '/ˌθiːəˈretɪkəl jiːld/', 'The maximum amount of product predicted by stoichiometric calculation.', '理论产量；根据化学计量计算可得到的最大产物量。', 'core'),
        term('actual yield', '/ˈæktʃuəl jiːld/', 'The amount of product actually obtained in an experiment.', '实际产量；实验中实际得到的产物量。', 'core'),
        term('percent yield', '/pərˈsent jiːld/', 'The actual yield divided by the theoretical yield, multiplied by 100%.', '百分产率；实际产量除以理论产量再乘以 100%。', 'core'),
        term('limiting reagent', '/ˈlɪmɪtɪŋ riˈeɪdʒənt/', 'The reactant that is used up first and limits the amount of product formed.', '限量反应物；最先耗尽并限制生成物产量的反应物。', 'core'),
        term('excess reagent', '/ɪkˈses riˈeɪdʒənt/', 'A reactant that remains after the limiting reagent is used up.', '过量反应物；限量反应物耗尽后仍有剩余的反应物。', 'core'),
        term('mass-mass calculation', '/mæs mæs ˌkælkjəˈleɪʃən/', 'A stoichiometric calculation from the mass of one substance to the mass of another.', '质量-质量计算；由一种物质质量求另一种物质质量的化学计量计算。', 'important'),
        term('mole-mole calculation', '/moʊl moʊl ˌkælkjəˈleɪʃən/', 'A stoichiometric calculation using mole ratios only.', '摩尔-摩尔计算；仅利用摩尔比进行的化学计量计算。', 'important'),
        term('given quantity', '/ˈɡɪvən ˈkwɑːntəti/', 'The amount provided in a problem.', '已知量；题目中给出的数量。', 'support'),
        term('required quantity', '/rɪˈkwaɪərd ˈkwɑːntəti/', 'The amount that a problem asks you to find.', '求解量；题目要求计算的数量。', 'support')
      ]
    },
    {
      id: 'solutions-solubility',
      name: 'Solutions & Solubility',
      bigIdea: 'Solubility depends on the nature of the solute and solvent.',
      terms: [
        term('solution', '/səˈluːʃən/', 'A homogeneous mixture of a solute dissolved in a solvent.', '溶液；溶质溶解在溶剂中形成的均匀混合物。', 'core'),
        term('solute', '/ˈsɑːljuːt/', 'The substance that is dissolved in a solution.', '溶质；在溶液中被溶解的物质。', 'core'),
        term('solvent', '/ˈsɑːlvənt/', 'The substance that dissolves the solute.', '溶剂；溶解溶质的物质。', 'core'),
        term('aqueous', '/ˈeɪkwiəs/', 'Dissolved in water.', '水溶的；溶于水中的。', 'core'),
        term('concentration', '/ˌkɑːnsənˈtreɪʃən/', 'The amount of solute in a given amount of solution.', '浓度；一定量溶液中溶质的量。', 'core'),
        term('molarity', '/moʊˈlærəti/', 'Concentration expressed as moles of solute per litre of solution.', '摩尔浓度；每升溶液中溶质的摩尔数。', 'core'),
        term('dilution', '/daɪˈluːʃən/', 'The process of lowering concentration by adding solvent.', '稀释；加入溶剂降低浓度的过程。', 'core'),
        term('saturated solution', '/ˈsætʃəreɪtɪd səˈluːʃən/', 'A solution containing the maximum amount of dissolved solute at a given temperature.', '饱和溶液；一定温度下含有最大溶解量溶质的溶液。', 'core'),
        term('unsaturated solution', '/ʌnˈsætʃəreɪtɪd səˈluːʃən/', 'A solution that can dissolve more solute at a given temperature.', '不饱和溶液；一定温度下还能继续溶解更多溶质的溶液。', 'important'),
        term('solubility', '/ˌsɑːljuˈbɪləti/', 'The maximum amount of solute that can dissolve in a solvent under specific conditions.', '溶解度；特定条件下溶质能在溶剂中溶解的最大量。', 'core'),
        term('electrolyte', '/ɪˈlektrəlaɪt/', 'A substance that forms ions in solution and conducts electricity.', '电解质；在溶液中形成离子并能导电的物质。', 'core'),
        term('dissociation', '/dɪˌsoʊsiˈeɪʃən/', 'The separation of ions when an ionic compound dissolves in water.', '解离；离子化合物溶于水时分离成离子的过程。', 'important')
      ]
    },
    {
      id: 'organic-chemistry',
      name: 'Organic Chemistry',
      bigIdea: 'Organic chemistry has important applications in society, health, and the environment.',
      terms: [
        term('organic chemistry', '/ɔːrˈɡænɪk ˈkemɪstri/', 'The study of carbon-containing compounds, especially those with C-H bonds.', '有机化学；研究含碳化合物，特别是含 C-H 键化合物的化学。', 'core'),
        term('hydrocarbon', '/ˌhaɪdrəˈkɑːrbən/', 'A compound containing only carbon and hydrogen.', '烃；只含碳和氢的化合物。', 'core'),
        term('alkane', '/ˈælkeɪn/', 'A saturated hydrocarbon with only single bonds.', '烷烃；只含单键的饱和烃。', 'core'),
        term('alkene', '/ˈælkiːn/', 'An unsaturated hydrocarbon with at least one carbon-carbon double bond.', '烯烃；含至少一个碳碳双键的不饱和烃。', 'core'),
        term('alkyne', '/ˈælkaɪn/', 'An unsaturated hydrocarbon with at least one carbon-carbon triple bond.', '炔烃；含至少一个碳碳三键的不饱和烃。', 'core'),
        term('saturated hydrocarbon', '/ˈsætʃəreɪtɪd ˌhaɪdrəˈkɑːrbən/', 'A hydrocarbon with only single bonds between carbon atoms.', '饱和烃；碳原子之间只含单键的烃。', 'important'),
        term('unsaturated hydrocarbon', '/ʌnˈsætʃəreɪtɪd ˌhaɪdrəˈkɑːrbən/', 'A hydrocarbon containing one or more double or triple bonds.', '不饱和烃；含有一个或多个双键或三键的烃。', 'important'),
        term('structural formula', '/ˈstrʌktʃərəl ˈfɔːrmjələ/', 'A formula that shows how atoms are connected in a molecule.', '结构式；显示分子中原子连接方式的化学式。', 'core'),
        term('isomer', '/ˈaɪsəmər/', 'Compounds with the same molecular formula but different structures.', '异构体；分子式相同但结构不同的化合物。', 'core'),
        term('functional group', '/ˈfʌŋkʃənəl ɡruːp/', 'A specific group of atoms that gives an organic molecule characteristic properties.', '官能团；赋予有机分子特征性质的一组原子。', 'core'),
        term('alcohol', '/ˈælkəhɔːl/', 'An organic compound containing a hydroxyl group, -OH.', '醇；含羟基 -OH 的有机化合物。', 'important'),
        term('carboxylic acid', '/kɑːrˌbɑːksɪlɪk ˈæsɪd/', 'An organic acid containing the carboxyl group, -COOH.', '羧酸；含羧基 -COOH 的有机酸。', 'important'),
        term('polymer', '/ˈpɑːlɪmər/', 'A large molecule made from many repeating smaller units.', '聚合物；由许多重复小单元组成的大分子。', 'important')
      ]
    },
    {
      id: 'green-chemistry',
      name: 'Green Chemistry & Safety',
      bigIdea: 'Green chemistry designs safer and more sustainable chemical processes.',
      terms: [
        term('green chemistry', '/ɡriːn ˈkemɪstri/', 'The design of chemical products and processes that reduce hazards and waste.', '绿色化学；设计减少危害和废物的化学产品与过程。', 'core'),
        term('sustainability', '/səˌsteɪnəˈbɪləti/', 'Meeting present needs without preventing future generations from meeting theirs.', '可持续性；满足当前需要且不损害未来世代需求的能力。', 'core'),
        term('renewable resource', '/rɪˈnuːəbəl ˈriːsɔːrs/', 'A resource that can be replenished naturally on a human time scale.', '可再生资源；能在人类时间尺度内自然补充的资源。', 'important'),
        term('non-renewable resource', '/ˌnɑːn rɪˈnuːəbəl ˈriːsɔːrs/', 'A resource that is used faster than it is naturally replaced.', '不可再生资源；消耗速度快于自然补充速度的资源。', 'important'),
        term('toxic', '/ˈtɑːksɪk/', 'Harmful or poisonous to living organisms.', '有毒的；对生物有害或有毒的。', 'core'),
        term('pollutant', '/pəˈluːtənt/', 'A substance that contaminates the environment.', '污染物；污染环境的物质。', 'important'),
        term('atom economy', '/ˈætəm ɪˈkɑːnəmi/', 'A measure of how efficiently reactant atoms are incorporated into the desired product.', '原子经济性；反应物原子进入目标产物的效率。', 'core'),
        term('waste reduction', '/weɪst rɪˈdʌkʃən/', 'The practice of decreasing unwanted materials from a process.', '减少废物；降低过程中产生废弃物的做法。', 'important'),
        term('WHMIS', '/ˈwɪmɪs/', 'Canada’s Workplace Hazardous Materials Information System.', 'WHMIS；加拿大工作场所有害物质信息系统。', 'core'),
        term('safety data sheet', '/ˈseɪfti ˈdeɪtə ʃiːt/', 'A document that describes hazards and safe handling of a chemical.', '安全数据表；说明化学品危害和安全处理方法的文件。', 'core'),
        term('corrosive', '/kəˈroʊsɪv/', 'Able to chemically damage living tissue or materials.', '腐蚀性的；能化学损伤组织或材料的。', 'core'),
        term('flammable', '/ˈflæməbəl/', 'Able to catch fire easily.', '易燃的；容易着火燃烧的。', 'core')
      ]
    }
  ];

  var questions = [
    q('scientific-skills-q1', 'scientific-skills', 'Which term describes how close a measurement is to the accepted value?', ['precision', 'accuracy', 'uncertainty', 'hypothesis'], 1, 'Accuracy describes closeness to the true or accepted value.', ['accuracy'], 'core'),
    q('scientific-skills-q2', 'scientific-skills', 'Which method uses units and conversion factors to solve chemistry problems?', ['scientific notation', 'dimensional analysis', 'random error', 'observation'], 1, 'Dimensional analysis tracks units through each calculation step.', ['dimensional-analysis'], 'core'),
    q('scientific-skills-q3', 'scientific-skills', 'Repeated measurements close to each other show high:', ['accuracy', 'precision', 'uncertainty', 'conversion'], 1, 'Precision is about repeatability, not necessarily closeness to the true value.', ['precision'], 'core'),
    q('matter-classification-q1', 'matter-classification', 'A pure substance made of only one type of atom is a/an:', ['compound', 'mixture', 'element', 'solution'], 2, 'An element contains only one kind of atom.', ['element'], 'core'),
    q('matter-classification-q2', 'matter-classification', 'Salt water is best classified as a:', ['homogeneous mixture', 'heterogeneous mixture', 'element', 'compound only'], 0, 'Dissolved salt is uniformly distributed in water, so it is homogeneous.', ['mixture', 'homogeneous'], 'core'),
    q('matter-classification-q3', 'matter-classification', 'Rust forming on iron is an example of a:', ['physical change', 'chemical change', 'change of state', 'mixture'], 1, 'Rust is a new substance, so this is a chemical change.', ['chemical-change'], 'core'),
    q('atomic-structure-q1', 'atomic-structure', 'Atoms of the same element with different numbers of neutrons are called:', ['ions', 'isotopes', 'molecules', 'compounds'], 1, 'Isotopes have the same number of protons but different numbers of neutrons.', ['isotope'], 'core'),
    q('atomic-structure-q2', 'atomic-structure', 'The atomic number of an element equals its number of:', ['neutrons', 'electrons only', 'protons', 'protons plus neutrons'], 2, 'Atomic number is defined by the number of protons.', ['atomic-number'], 'core'),
    q('atomic-structure-q3', 'atomic-structure', 'A negatively charged ion is called a/an:', ['cation', 'anion', 'isotope', 'orbital'], 1, 'An anion has gained electrons and carries a negative charge.', ['anion', 'ion'], 'core'),
    q('periodic-trends-q1', 'periodic-trends', 'A vertical column in the periodic table is called a:', ['period', 'group', 'isotope', 'shell'], 1, 'Groups are vertical columns; periods are horizontal rows.', ['group', 'periodic-table'], 'core'),
    q('periodic-trends-q2', 'periodic-trends', 'Electronegativity measures an atom’s ability to:', ['lose neutrons', 'attract shared electrons', 'increase mass number', 'change into a gas'], 1, 'Electronegativity is attraction for shared bonding electrons.', ['electronegativity'], 'core'),
    q('periodic-trends-q3', 'periodic-trends', 'Elements in Group 18 are called:', ['alkali metals', 'halogens', 'noble gases', 'metalloids'], 2, 'Group 18 elements are noble gases and are generally unreactive.', ['noble-gas'], 'important'),
    q('bonding-geometry-q1', 'bonding-geometry', 'A covalent bond forms when atoms:', ['share electrons', 'share protons', 'exchange neutrons', 'separate into ions only'], 0, 'Covalent bonds involve shared electron pairs.', ['covalent-bond'], 'core'),
    q('bonding-geometry-q2', 'bonding-geometry', 'VSEPR theory is used to predict:', ['atomic mass', 'molecular shape', 'percent yield', 'solubility rules'], 1, 'VSEPR predicts molecular geometry based on electron group repulsions.', ['vsepr', 'molecular-geometry'], 'core'),
    q('bonding-geometry-q3', 'bonding-geometry', 'A pair of valence electrons not used in bonding is a:', ['coefficient', 'lone pair', 'cation', 'solute'], 1, 'A lone pair is a nonbonding pair of valence electrons.', ['lone-pair'], 'core'),
    q('names-formulae-q1', 'names-formulae', 'A small number written within a chemical formula to show atom count is a:', ['coefficient', 'subscript', 'mole ratio', 'Roman numeral'], 1, 'Subscripts indicate how many atoms or ions are present in a formula unit or molecule.', ['subscript'], 'core'),
    q('names-formulae-q2', 'names-formulae', 'A Roman numeral in a compound name usually shows:', ['the number of atoms', 'the charge of a multivalent metal', 'the molar mass', 'the state of matter'], 1, 'Roman numerals identify the charge of a multivalent metal ion.', ['roman-numeral', 'multivalent-metal'], 'important'),
    q('names-formulae-q3', 'names-formulae', 'A polyatomic ion is:', ['a single neutral atom', 'a charged group of bonded atoms', 'a metal atom only', 'a mixture of elements'], 1, 'A polyatomic ion contains multiple bonded atoms and has an overall charge.', ['polyatomic-ion'], 'core'),
    q('mole-concept-q1', 'mole-concept', 'One mole contains approximately:', ['6.022 × 10^23 particles', '1.00 × 10^3 particles', '22.4 particles', '100 particles'], 0, 'Avogadro’s number is 6.022 × 10^23 particles per mole.', ['mole', 'avogadros-number'], 'core'),
    q('mole-concept-q2', 'mole-concept', 'Molar mass is the mass of:', ['one atom only', 'one litre of solution', 'one mole of a substance', 'one electron'], 2, 'Molar mass means mass per mole.', ['molar-mass'], 'core'),
    q('mole-concept-q3', 'mole-concept', 'To convert grams of a substance into moles, use:', ['atomic number', 'molar mass', 'percent yield', 'electronegativity'], 1, 'Mass-to-mole conversions divide by molar mass.', ['mass-to-mole', 'molar-mass'], 'core'),
    q('chemical-reactions-q1', 'chemical-reactions', 'The starting substances in a chemical reaction are:', ['products', 'reactants', 'catalysts', 'spectator ions'], 1, 'Reactants are present before the reaction proceeds.', ['reactant'], 'core'),
    q('chemical-reactions-q2', 'chemical-reactions', 'A balanced chemical equation shows conservation of:', ['volume only', 'mass and atoms', 'temperature only', 'colour'], 1, 'A balanced equation has equal numbers of each atom on both sides.', ['balanced-equation', 'conservation-of-mass'], 'core'),
    q('chemical-reactions-q3', 'chemical-reactions', 'A reaction that forms an insoluble solid in solution is a:', ['combustion reaction', 'precipitation reaction', 'synthesis reaction', 'decomposition reaction'], 1, 'The insoluble solid is the precipitate.', ['precipitation'], 'important'),
    q('stoichiometry-q1', 'stoichiometry', 'The reactant that runs out first is the:', ['excess reagent', 'limiting reagent', 'product', 'catalyst'], 1, 'The limiting reagent limits how much product can form.', ['limiting-reagent'], 'core'),
    q('stoichiometry-q2', 'stoichiometry', 'Percent yield compares actual yield with:', ['atomic number', 'molarity', 'theoretical yield', 'electronegativity'], 2, 'Percent yield = actual yield / theoretical yield × 100%.', ['percent-yield'], 'core'),
    q('stoichiometry-q3', 'stoichiometry', 'Stoichiometry calculations depend first on a:', ['balanced chemical equation', 'periodic trend only', 'safety data sheet', 'pH scale'], 0, 'The coefficients in a balanced equation give mole ratios.', ['stoichiometry', 'balanced-equation'], 'core'),
    q('solutions-solubility-q1', 'solutions-solubility', 'In salt water, water is the:', ['solute', 'solvent', 'precipitate', 'ion'], 1, 'The solvent is the substance doing the dissolving.', ['solvent'], 'core'),
    q('solutions-solubility-q2', 'solutions-solubility', 'Molarity is measured in:', ['grams per mole', 'moles per litre', 'particles per atom', 'litres per mole only'], 1, 'Molarity is concentration in mol/L.', ['molarity'], 'core'),
    q('solutions-solubility-q3', 'solutions-solubility', 'A solution that can still dissolve more solute is:', ['saturated', 'unsaturated', 'precipitated', 'corrosive'], 1, 'Unsaturated solutions have not reached their maximum dissolved amount.', ['unsaturated-solution'], 'important'),
    q('organic-chemistry-q1', 'organic-chemistry', 'A compound containing only carbon and hydrogen is a:', ['hydrocarbon', 'hydrate', 'polyatomic ion', 'base'], 0, 'Hydrocarbons contain only C and H.', ['hydrocarbon'], 'core'),
    q('organic-chemistry-q2', 'organic-chemistry', 'An alkene contains at least one:', ['single bond only', 'carbon-carbon double bond', 'ionic bond', 'hydrogen bond'], 1, 'Alkenes are unsaturated hydrocarbons with C=C bonds.', ['alkene'], 'core'),
    q('organic-chemistry-q3', 'organic-chemistry', 'Compounds with the same molecular formula but different structures are:', ['isotopes', 'isomers', 'ions', 'cations'], 1, 'Isomers have the same formula but different structural arrangements.', ['isomer'], 'core'),
    q('green-chemistry-q1', 'green-chemistry', 'Green chemistry mainly aims to:', ['increase waste', 'reduce hazards and waste', 'avoid all calculations', 'make only organic compounds'], 1, 'Green chemistry designs safer and less wasteful products and processes.', ['green-chemistry'], 'core'),
    q('green-chemistry-q2', 'green-chemistry', 'WHMIS is related to:', ['periodic trends', 'chemical safety information', 'mole ratios', 'organic naming'], 1, 'WHMIS communicates workplace hazardous material information.', ['whmis'], 'core'),
    q('green-chemistry-q3', 'green-chemistry', 'Atom economy measures how efficiently reactant atoms become:', ['waste only', 'the desired product', 'neutrons', 'solvent'], 1, 'High atom economy means more reactant atoms appear in the desired product.', ['atom-economy'], 'core')
  ];

  window.CHEM11_UNITS = units;
  window.CHEM11_QUESTIONS = questions;
})();
