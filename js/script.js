var selectOptionNumber = 4;
$(document).ready(function() {
    $('#video_multiselect').multiselect({
        buttonWidth: '250px',
        nonSelectedText: '請選擇至少一個頻道',
        onChange: function(element, insert) {
            id = element[0].value
            if (insert) {
                const streaming = findStreaming(id);
                appendStreaming(streaming);
            } else {
                removeStreaming(id);
            }

            // Get selected options.
            var selectedOptions = $('#video_multiselect option:selected');
 
            if (selectedOptions.length >= selectOptionNumber) {
                // Disable all other checkboxes.
                var nonSelectedOptions = $('#video_multiselect option').filter(function() {
                    return !$(this).is(':selected');
                });

                nonSelectedOptions.each(function() {
                    var input = $('input[value="' + $(this).val() + '"]');
                    input.prop('disabled', true);
                    input.closest('li').addClass('disabled');
                });
            }
            else {
                // Enable all checkboxes.
                $('#video_multiselect option').each(function() {
                    var input = $('input[value="' + $(this).val() + '"]');
                    input.prop('disabled', false);
                    input.closest('li').removeClass('disabled');
                });
            }
        }
    });

    $('#video_multiselect').multiselect('dataprovider', getStreaminOptions(streamings));
    selected_options = $('#video_multiselect option:selected').map(function(a, item){return item.value;});
    for (var i = 0; i < selected_options.length; i++) {
        const streaming = findStreaming(selected_options[i]);
        appendStreaming(streaming);
    }

    
});

function getStreaminOptions(streamings) {
    return streamings.map(function(item){
        return {
            label: item.location_name,
            title: item.location_name,
            value: item.id,
            selected: item.selected
        }
    })
}

function appendStreaming(streaming) {
    $('#streaming_list').append('<div class="col-lg-4 streaming-video mb-4" id="streaming_video_'+streaming.id+'"><iframe id="player" width=100% src="http://www.youtube.com/embed/'+streaming.youtube_id+'?autoplay=1&mute=1&info=0&controls=0" frameborder="0"></iframe></div>')
}

function removeStreaming(id) {
    $('#streaming_video_'+id).remove()
}

function findStreaming(id) {
    return streamings.find(element => element.id == id);
}
