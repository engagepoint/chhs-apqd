Feature: Create new account, login and update profile information

  Scenario: Prepare test data

  Scenario: Open home page and register new user
    When open home page
    Given random alphabetic name with 'testuser' and length '4' saved to 'testuser' variable
    Then register new user with email '${testuser}@mailinator.com', login '${testuser}' and password 'password'
    When check confirmation letter for email '${testuser}@mailinator.com'

  Scenario: log in
    When open home page
    When login with login '${testuser}' and password 'password'
    When open my profile
    When fill gender 'Male', DOB mm-dd-yyyy '03'-'22'-'1983', license number '' in General Information
    When fill address '1035 West 12th Avenue, Chico, CA, USA', email 'test2@mailinator.com', telephone '5553331111' in Contact Information
    When change old password 'password' to the new one 'password2'
    When save changes in profile
