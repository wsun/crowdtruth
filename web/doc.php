<?php

class Reference {
  var $source;
  var $excerpt;
  var $support;
  var $rating;
  
  function build_reference($source, $excerpt, $support, $rating) {
    $this->source = $source;
    $this->excerpt = $excerpt;
    $this->support = $support;
    $this->rating = $rating;
  }
}

class Annotation {
  var $text;
  var $rating;
  var $references = array();
  var $n_refs = 0;

  function build_annotation($text, $rating) {
    $this->text = $text;
    $this->rating = $rating;
  }

  function add_reference($ref) {
    $this->references[$this->n_refs] = $ref;
    $this->n_refs++;
  }
}

class Transcription {
  var $annotations = array();
  var $n_anns = 0;

  function add_annotation($ann) {
    $this->annotations[$this->n_anns] = $ann;
    $this->n_anns++;
  }
}

$title = 'Mitt Romney Debate Speech';

$doc = 'Well, sure. I\'d like to clear up the record and go through it piece by piece. First of all, I don\'t have a $5 trillion tax cut. I don\'t have a tax cut of a scale that you\'re talking about. My view is that we ought to provide tax relief to people in the middle class. But I\'m not going to reduce the share of taxes paid by high- income people. High-income people are doing just fine in this economy. They\'ll do fine whether you\'re president or I am. The people who are having the hard time right now are middle- income Americans. Under the president\'s policies, middle-income Americans have been buried. They\'re — they\'re just being crushed. Middle-income Americans have seen their income come down by $4,300. This is a — this is a tax in and of itself. I\'ll call it the economy tax. It\'s been crushing. The same time, gasoline prices have doubled under the president, electric rates are up, food prices are up, health care costs have gone up by $2,500 a family.';

$ann1 = new Annotation();
$ann1->build_annotation('Middle-income Americans have seen their income come down by $4,300', 7.0);
$ref1 = new Reference();
$ref1->build_reference('http://www.cbsnews.com/8301-505145_162-57498356/middle-class-share-of-americas-income-shrinks/', 'A study released Wednesday by the Pew Research Center highlights diminished hopes, too, for the roughly 50 percent of adults defined as middle class, with household incomes ranging from $39,000 to $118,000. The report describes this mid-tier group as suffering its "worst decade in modern history," having fallen backward in income for the first time since the end of World War II.', true, 7.0);
$ref2 = new Reference();
$ref2->build_reference('http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&ved=0CDEQFjAA&url=http%3A%2F%2Ffactcheck.org%2F2012%2F10%2Fdubious-denver-debate-declarations%2F&ei=EVR2UL-QEYSiiQLC24C4Ag&usg=AFQjCNE1ZUBVE4tqJ0ko8Q_plo69ubS4EA&sig2=93526Ls3wGrFcezGyXDTQA','We found exaggerations and false claims flying thick and fast during the first debate between President Obama and his Republican challenger, Mitt Romney. Romney sometimes came off as a serial exaggerator.', false, 7.33);
$ann1->add_reference($ref1);
$ann1->add_reference($ref2);

$ann2 = new Annotation();
$ann2->build_annotation('gasoline prices have doubled under the president', 6.67);
$ref3 = new Reference();
$ref3->build_reference('http://www.mlive.com/opinion/grand-rapids/index.ssf/2012/10/question_of_the_day_was_gas_mo.html', 'To be sure, gas averaged $1.84 nationwide the day Obama took office, according to AAA. At $3.78 now, the national average has, indeed, more than doubled.', true, 5.0);
$ref4 = new Reference();
$ref4->build_reference('http://www.minnesotagasprices.com/retail_price_chart.aspx', 'In Jan. 2009, the gas price was around 2.20 per gallon. The current price is around 3.75 per gallon. In fact, the prices have not doubled. They actually increased less than 70%.', false, 7.33);
$ref5 = new Reference();
$ref5->build_reference('http://www.examiner.com/article/mitt-romney-criticizes-obama-on-doubling-of-gasoline-prices', 'The price of oil has been increasing from an average $45 a barrel when President Obama took office to $91.23 today up 100%.', true, 4.67);
$ann2->add_reference($ref3);
$ann2->add_reference($ref4);
$ann2->add_reference($ref5);

$ann3 = new Annotation();
$ann3->build_annotation('health care costs have gone up by $2,500 a family.', 6.67);
$ref6 = new Reference();
$ref6->build_reference('http://edition.cnn.com/2012/10/04/health/health-care-debate/index.html', 'The first mention of health care came about six minutes into the debate. Discussing how "middle-income Americans have been buried" financially under the president\'s policies, Republican challenger Mitt Romney said health care costs have gone up by $2,500 a family.', true, 7.67);
$ref7 = new Reference();
$ref7->build_reference('http://edition.cnn.com/2012/10/04/health/health-care-debate/index.html', 'You do pay more for health insurance, but Obama\'s policy isn\'t totally to blame. The first mention of health care came about six minutes into the debate. Discussing how "middle-income Americans have been buried" financially under the president\'s policies, Republican challenger Mitt Romney said health care costs have gone up by $2,500 a family', true, 6.0);
$ref8 = new Reference();
$ref8->build_reference('http://www.examiner.com/article/mitt-romney-criticizes-obama-on-doubling-of-gasoline-prices', 'The price of oil has been increasing from an average $45 a barrel when President Obama took office to $91.23 today up 100%.', true, 4.67);
$ann3->add_reference($ref6);
$ann3->add_reference($ref7);
$ann3->add_reference($ref8);

$trans = new Transcription();
$trans->add_annotation($ann1);
$trans->add_annotation($ann2);
$trans->add_annotation($ann3);

$arr = array();
$hash = array();
for($i = 0; $i < $trans->n_anns; $i++) {
  $ann = $trans->annotations[$i];
  $index = strpos($doc, $ann->text);
  $hash[$index] = $ann;
  $arr[$i * 2] = $index;
  $arr[$i * 2 + 1] = $index + strlen($ann->text);
  $arr_size += 2;
  $hash[$index] = $ann;
}
sort(&$arr);
$r_doc = '';
$last = 0;
for($i = 0; $i < $trans->n_anns; $i++) {
  $x1 = $arr[$i * 2];
  $x2 = $arr[$i * 2 + 1];
  if($x1 and $x2) {
    $r_doc .= substr($doc, $last, $x1 - $last);
    $r_doc .= "<a href='#' class='ann' id='ann$x1'>";
    $r_doc .= substr($doc, $x1, $x2 - $x1);
    $r_doc .= "</a>";
    $last = $x2;
  }
}
$r_doc .= substr($doc, $last);
$ann_doc = $r_doc;

?>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">

<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">
	<title>CrowdTruth of <?php echo $title; ?></title>
  <script src="http://code.jquery.com/jquery-latest.js"></script>
  <script src="js/bootstrap.min.js"></script>
  <script type="text/javascript" src="js/doc.js"></script>
  <link href="css/doc.css" rel="stylesheet" type="text/css">
  <link href="css/bootstrap.min.css" rel="stylesheet">
</head>

<body>

<?php

foreach(array_keys($hash) as $key) {
  echo "<div class='popup' id='popup$key' style='display:none'>";
  $ann = $hash[$key];
  echo "<div class='refhead'>";
  $r1 = $ann->rating * 10;
  echo "This statement was voted $r1% likely to be true overall.";
  echo "</div>";
  foreach($ann->references as $ref) {
    echo "<div class='ref'>";
    if ($ref->support) {
      $d = ' prove';
    } else {
      $d = ' disprove';
    }
    $r2 = $ref->rating * 10;
    echo "<a href='{$ref->source}' class='ref$d'>&ldquo;{$ref->excerpt}&rdquo; ($r2% Turker rating)</a>";
    echo "</div>";
  }
  echo "</div>";
}

?>

<div class='page' id='page'>
  <div class='title'>
    <?php echo $title; ?>
  </div>
  <div class='content'>
    <?php echo $ann_doc; ?>
  </div>
</div>

</body>

</html>
