require 'test/unit'
include Test::Unit::Assertions

@vowels = nil

step 'Vowels in English language are <vowels>.' do |vowels|
  @vowels = vowels.scan(/./)
end

step 'The word <word> has <count> vowels.' do |word, expected_count|
  assert_equal(expected_count.to_i, count_vowels(word))
end

step 'Almost all words have vowels <table>' do |words_table|
  words_table.rows.each do |row|
    word = row['Word']
    expected_count = row['Vowel Count'].to_i
    actual_count = count_vowels(word)
    assert_equal(expected_count, actual_count)
  end
end

step 'something' do ||
  raise 'Unimplemented Step'
end

step 'a basic step' do ||
  assert_equal(1+0,1)
end

def count_vowels(string)
  string.count(@vowels.to_s)
end

step 'a basic step <param>' do |arg_0|
	assert_equal(1+0,1)
end
