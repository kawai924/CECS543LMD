$(document).ready(function() {
  reset();
  $('#form-message').text('Please select an option');

  function reset() {
    // $('#repo-name').prop('disabled', true);
    // $('#label').prop('disabled', true);
    // $('#source-path').prop('disabled', true);
    // $('#manifest-target').prop('disabled', true);
    // $('#dest-path').prop('disabled', true);
    // $('#form-message').text('');
    $('#repo-name').hide();
    $('#label').hide();
    $('#source-path').hide();
    $('#manifest-target').hide();
    $('#dest-path').hide();
    $('#form-message').text('');
  }

  $("input[value='create']").change(function() {
    reset();
    // $('#repo-name').prop('disabled', false);
    // $('#source-path').prop('disabled', false);
    $('#repo-name').show();
    $('#source-path').show();
  });

  $("input[value='check-in']").change(function() {
    reset();
    $('#source-path').show();
    $('#repo-name').show();
  });

  $("input[value='check-out']").change(function() {
    reset();
    $('#form-message').text('Use label or ID');
    // $('#repo-name').prop('disabled', false);
    // $('#label').prop('disabled', false);
    // $('#manifest-target').prop('disabled', false);
    // $('#dest-path').prop('disabled', false);
    $('#repo-name').show();
    $('#label').show();
    $('#manifest-target').show();
    $('#dest-path').show();
  });

  $("input[value='label']").change(function() {
    reset();
    $('#form-message').text('Use label or ID');
    // $('#repo-name').prop('disabled', false);
    // $('#label').prop('disabled', false);
    // $('#manifest-target').prop('disabled', false);
    $('#repo-name').show();
    $('#label').show();
    $('#manifest-target').show();
  });
});

/* OLD CODES - MIGHT REUSE */
// //function to call node js function from JS using url request
// const url = '/dirlist';
// // on page load

// const getdir = async url => {
//   try {
//     const response = await fetch(url);
//     const text = await response.text().then(text => (result = text));
//   } catch (error) {
//     console.log('getDir has problem\n', error);
//   }

//   const dirlist = document.getElementById('dirlist');
//   dirlist.innerHTML = result;
// };

// // Get list of folders in database
// getdir(url);

// function createRepo() {
//   const textInput = document.getElementById('create-repo');
//   // setTimeout(function() {
//   //   textInput.value = "";
//   // }, 500);
//   const repoCreated = document.getElementById('repo-created');
//   repoCreated.innerHTML = '<h1>Repository Created</h1>';
//   setTimeout(function() {
//     repoCreated.style.visibility = 'hidden';
//   }, 1000);
//   getdir(url);
// }
